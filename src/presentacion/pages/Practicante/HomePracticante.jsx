import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { UserX } from "lucide-react";

import { obtenerMiPractica } from "../../../aplicacion/practicante/obtenerMiPractica.js";
import { practicanteRepository } from "../../../infraestructura/repository/practicanteRepository.js";

import RetirarPracticanteModal from "../../components/modals/RetirarPracticanteModal";
import ConfirmModal from "../../components/modals/ConfirmModal";
// TODO: ajusta la ruta según dónde tengas EstadoBadge
import EstadoBadge from "../..//components/estadoBadge/EstadoBadge.jsx";
import { crearRetiroPracticante } from "../../../aplicacion/retirarPracticante/crearRetiro";
import { retiroPracticanteRepository } from "../../../infraestructura/repository/retirarPracticanteRepository";

// ============================================================
// HELPERS DE SESIÓN (localStorage)
// ============================================================

const getPracticanteIdFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );

    return JSON.parse(json)?.practicante_id ?? null;
  } catch {
    return null;
  }
};

const getUsuarioLocal = () => {
  try {
    return JSON.parse(localStorage.getItem("user") ?? "null");
  } catch {
    return null;
  }
};

// ============================================================
// SKELETON
// ============================================================

const Bar = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded ${className}`} />
);

const CardSkeleton = ({ lines = 4 }) => (
  <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
    <Bar className="h-4 w-24 mb-4 bg-red-100" />
    <div className="flex flex-col gap-3">
      {Array.from({ length: lines }).map((_, i) => (
        <Bar key={i} className={`h-3 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
      ))}
    </div>
  </div>
);

const HomePracticanteSkeleton = () => (
  <div
    className="flex-1 flex items-center justify-center animate-pulse"
    role="status"
    aria-label="Cargando información de la práctica"
  >
    <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl w-full">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 w-full md:w-2/5">
        <Bar className="h-5 w-48" />
        <div className="w-full max-w-xs aspect-square bg-gray-200 rounded-2xl" />
      </div>

      {/* Cards */}
      <div className="w-full md:w-3/5 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={4} />
        </div>

        <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_2fr] gap-5">
            <div className="flex flex-col gap-3">
              <Bar className="h-4 w-20 bg-red-100" />
              <Bar className="h-3 w-12" />
              <Bar className="h-3 w-3/4" />
              <Bar className="h-3 w-32 mt-3" />
              <Bar className="h-3 w-full" />
            </div>
            <div className="sm:border-l sm:border-gray-100 sm:pl-5 flex flex-col gap-3">
              <Bar className="h-4 w-44 bg-red-100" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-full" />
              <Bar className="h-3 w-11/12" />
              <Bar className="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const HomePracticante = () => {
  const [practica, setPractica] = useState(null);
  const [vacante, setVacante] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== Retiro =====
  const [openRetiroModal, setOpenRetiroModal] = useState(false);
  const [openConfirmRetiro, setOpenConfirmRetiro] = useState(false);
  const [datosRetiro, setDatosRetiro] = useState(null); // { motivo, archivo }
  const [retirando, setRetirando] = useState(false);

  const fetchDatosPractica = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await obtenerMiPractica(practicanteRepository);

      setPractica(data.practica);
      setVacante(data.vacante);
      setEmpresa(data.empresa);
      setTutor(data.tutor);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la práctica.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatosPractica();
  }, []);

  // ============================================================
  // RETIRARME DE LA PRÁCTICA
  // ============================================================

  const practicaEnCurso = ["en_curso", "activa"].includes(
    practica?.estado?.toLowerCase()
  );

  const usuarioLocal = getUsuarioLocal();

  // Objeto con la forma que espera RetirarPracticanteModal (mostrarDatosVacante)
  const practicanteActual = {
    practicante_id: getPracticanteIdFromToken(),
    nombres: usuarioLocal?.nombres,
    apellidos: usuarioLocal?.apellidos,
    correo: usuarioLocal?.correo,
    apertura: { vacante: vacante?.nombre },
  };

  const handleAbrirRetiro = () => {
    if (!practicaEnCurso) {
      toast.error("Solo puedes retirarte de una práctica en curso.");
      return;
    }

    if (!practicanteActual.practicante_id) {
      toast.error("No se pudo identificar tu sesión. Inicia sesión de nuevo.");
      return;
    }

    setOpenRetiroModal(true);
  };

  const handleCerrarRetiro = () => {
    if (retirando) return;
    setOpenRetiroModal(false);
    setDatosRetiro(null);
  };

  // Paso 1: el modal entrega motivo + archivo.
  const handleSolicitarRetiro = ({ motivo, archivo }) => {
    setDatosRetiro({ motivo, archivo });
    setOpenConfirmRetiro(true);
  };

  // Cancelar la reconfirmación: el formulario sigue intacto.
  const handleCancelarConfirmacion = () => {
    if (retirando) return;
    setOpenConfirmRetiro(false);
  };

  // Paso 2: confirmación final -> ahora sí se envía.
  const handleConfirmarRetiro = async () => {
    if (retirando || !datosRetiro) return;

    const practicanteId = getPracticanteIdFromToken();

    if (!practicanteId) {
      toast.error("No se pudo identificar tu sesión. Inicia sesión de nuevo.");
      return;
    }

    try {
      setRetirando(true);

      await crearRetiroPracticante(
        { retiroPracticanteRepository },
        {
          motivo: datosRetiro.motivo,
          archivo: datosRetiro.archivo,
          practicante_id: practicanteId,
        }
      );
    } catch (err) {
      console.error("Error al retirarse de la práctica:", err);

      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "No fue posible procesar el retiro."
      );

      setOpenConfirmRetiro(false);
      setRetirando(false);
      return;
    }

    toast.success(
      "Tu retiro fue registrado. Se notificó a todos los involucrados."
    );

    setOpenConfirmRetiro(false);
    setOpenRetiroModal(false);
    setDatosRetiro(null);
    setRetirando(false);

    await fetchDatosPractica();
  };

  return (
    <div>
      <div className="h-full flex flex-col p-6">

        {/* ===== Barra superior: duración + estado ===== */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 mb-1 animate-pulse">
            <Bar className="h-3 w-64" />
            <Bar className="h-5 w-20 rounded-full" />
          </div>
        ) : (
          practica && (
            <div className="flex items-center justify-center gap-3 text-xs text-gray-400 mb-1">
              <span>
                Inicio práctica: {practica.fecha_inicio} — Fin práctica: {practica.fecha_fin}
              </span>
              <EstadoBadge estado={practica.estado} size="sm" />
            </div>
          )
        )}

        <h1 className="text-3xl font-bold text-center mb-8">Bienvenido</h1>

        {loading && <HomePracticanteSkeleton />}

        {error && <p className="text-center text-red-600">{error}</p>}

        {/* ===== Contenido centrado verticalmente en el espacio disponible ===== */}
        {!loading && !error && empresa && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col md:flex-row items-start gap-8 max-w-6xl w-full">

              {/* Logo grande a la izquierda */}
              <div className="flex flex-col items-center gap-3 w-full md:w-2/5">
                <p className="text-base font-semibold text-gray-700 border-b-2 border-red-500 pb-1">
                  Prácticas a realizar en
                </p>

                {empresa.logo ? (
                  <img
                    src={empresa.logo}
                    alt={`Logo ${empresa.nombre}`}
                    className="w-full max-w-xs h-auto object-contain"
                  />
                ) : (
                  <div className="w-full max-w-xs aspect-square flex items-center justify-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
                    Sin logo
                  </div>
                )}
              </div>

              {/* ===== Columna derecha: 3 cards separadas ===== */}
              <div className="w-full md:w-3/5 flex flex-col gap-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Card Empresa */}
                  <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
                    <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                      Empresa
                    </h2>

                    <dl className="flex flex-col gap-2 text-sm text-gray-700">
                      <div>
                        <dt className="font-semibold inline">Nombre: </dt>
                        <dd className="inline">{empresa.nombre}</dd>
                      </div>

                      <div>
                        <dt className="font-semibold inline">Dirección: </dt>
                        <dd className="inline">{empresa.direccion}</dd>
                      </div>

                      {empresa.usuario && (
                        <div>
                          <dt className="font-semibold inline">Director: </dt>
                          <dd className="inline">
                            {empresa.usuario.nombres} {empresa.usuario.apellidos}
                          </dd>
                        </div>
                      )}

                      {empresa.usuario?.correo && (
                        <div>
                          <dt className="font-semibold inline">Correo: </dt>
                          <dd className="inline">{empresa.usuario.correo}</dd>
                        </div>
                      )}

                      {empresa.usuario?.telefono && (
                        <div>
                          <dt className="font-semibold inline">Teléfono: </dt>
                          <dd className="inline">{empresa.usuario.telefono}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Card Tutor Empresarial */}
                  {tutor && (
                    <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
                      <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                        Tutor Empresarial
                      </h2>

                      <dl className="flex flex-col gap-2 text-sm text-gray-700">
                        <div>
                          <dt className="font-semibold inline">Nombre: </dt>
                          <dd className="inline">
                            {tutor.usuario?.nombres} {tutor.usuario?.apellidos}
                          </dd>
                        </div>

                        <div>
                          <dt className="font-semibold inline">Cargo: </dt>
                          <dd className="inline">{tutor.cargo}</dd>
                        </div>

                        {tutor.usuario?.correo && (
                          <div>
                            <dt className="font-semibold inline">Correo: </dt>
                            <dd className="inline">{tutor.usuario.correo}</dd>
                          </div>
                        )}

                        {tutor.usuario?.telefono && (
                          <div>
                            <dt className="font-semibold inline">Teléfono: </dt>
                            <dd className="inline">{tutor.usuario.telefono}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  )}
                </div>

                {/* Card Vacante */}
                {vacante && (
                  <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_2fr] gap-5">

                      <div className="flex flex-col justify-between">
                        <div>
                          <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                            Vacante
                          </h2>

                          <p className="font-semibold text-sm text-gray-700 mb-1">
                            Área
                          </p>
                          <p className="text-sm text-gray-600">
                            {vacante.nombre}
                          </p>
                        </div>

                        {practica && (
                          <div className="mt-4">
                            <p className="font-semibold text-sm text-gray-700 mb-1">
                              Duración de la práctica
                            </p>
                            <p className="text-sm text-gray-600">
                              {practica.fecha_inicio} — {practica.fecha_fin}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="sm:border-l sm:border-gray-100 sm:pl-5">
                        <h2 className="text-red-600 font-bold text-sm uppercase tracking-wide mb-3">
                          Descripción de la vacante
                        </h2>

                        <p className="text-sm text-gray-600 leading-relaxed max-h-36 overflow-y-auto pr-2">
                          {vacante.descripcion}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== Botones inferiores: Retiro (izq) + ARL (der) ===== */}
        <div className="flex items-center justify-between mt-4">
          {loading ? (
            <div className="flex items-center justify-between w-full animate-pulse">
              <Bar className="h-10 w-56 rounded-full" />
              <Bar className="h-10 w-36 rounded-full" />
            </div>
          ) : (
            <>
              {practica ? (
                <button
                  onClick={handleAbrirRetiro}
                  disabled={!practicaEnCurso || retirando}
                  title={
                    practicaEnCurso
                      ? "Retirarme de la práctica"
                      : "Solo disponible mientras la práctica está en curso"
                  }
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border transition ${practicaEnCurso
                    ? "border-red-500 text-red-600 hover:bg-red-50 cursor-pointer"
                    : "border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                >
                  <UserX size={18} />
                  Retirarme de la práctica
                </button>
              ) : (
                <span />
              )}

              <a
                href="https://operacionesarl.positiva.gov.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-full font-semibold text-white text-sm
    bg-red-600 hover:bg-red-700
    shadow-md hover:shadow-lg
    transition-all duration-300
    animate-bounce-sutil
    hover:scale-105"
              >
                Consultar ARL
              </a>
            </>
          )}
        </div>
      </div>

      {/* ===== Modal de retiro (formulario) ===== */}
      <RetirarPracticanteModal
        open={openRetiroModal}
        practicante={practicanteActual}
        onClose={handleCerrarRetiro}
        onRetirar={handleSolicitarRetiro}
        mostrarDatosVacante
      />

      {/* ===== Reconfirmación (va DESPUÉS para quedar encima del formulario) ===== */}
      <ConfirmModal
        isOpen={openConfirmRetiro}
        title="Esta acción es irrevocable"
        message="Al confirmar, tu retiro de la práctica no podrá deshacerse y se notificará al tutor empresarial, al docente, a la empresa y al director. ¿Deseas continuar?"
        confirmLabel={retirando ? "Procesando..." : "Sí, retirarme"}
        cancelLabel="Cancelar"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={handleCancelarConfirmacion}
        onConfirm={handleConfirmarRetiro}
      />
    </div>
  );
};

export default HomePracticante;