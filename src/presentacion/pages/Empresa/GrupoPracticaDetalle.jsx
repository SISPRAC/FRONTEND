import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  ClipboardList,
  Trash2,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  UserX,
  FileText,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";
import GenericTable from "../../components/Table/GenericTable.jsx";

import ConfirmModal from "../../components/modals/ConfirmModal";
import AperturaVacanteModal from "../../components/modals/AperturaVacanteModal.jsx";
import RetirarPracticanteModal from "../../components/modals/RetirarPracticanteModal";
import EncuestaTutorEmpresarialModal from "../../components/modals/EncuestaTutorEmpresarialModal";
import VerRetiroModal from "../../components/modals/VerRetiroModal.jsx";
import CertificadoPracticanteModal from "../../components/modals/CertificadoPracticanteModal.jsx";
import GrupoPracticaDetalleSkeleton from "../../components/skeletons/GrupoPracticaDetalleSkeleton.jsx"

import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository.js";
import { vacanteRepository } from "../../../infraestructura/repository/vacanteRepository.js";
import { tutorEmpresarialRepository } from "../../../infraestructura/repository/tutorEmpresarialRepository.js";
import { aperturaVacanteRepository } from "../../../infraestructura/repository/aperturaVacanteRepository.js";
import { retiroPracticanteRepository } from "../../../infraestructura/repository/retirarPracticanteRepository";

import { obtenerDetalleGrupoEmpresa } from "../../../aplicacion/empresa/obtenerDetalleGrupoEmpresa.js";
import { subirCertificadoFinalizacion } from "../../../aplicacion/empresa/subirCertificadoFinalizacion.js";
import { obtenerCertificadoFinalizacion } from "../../../aplicacion/empresa/obtenerCertificadoFinalizacion.js";
import { getVacantesByEmpresa } from "../../../aplicacion/vacante/getVacantesByEmpresa.js";
import { getTutorEmpresariales } from "../../../aplicacion/tutorEmpresarial/getTutorEmpresarial.js";
import { crearAperturaVacante } from "../../../aplicacion/aperturaVacante/crearAperturaVacante.js";
import { actualizarAperturaVacante } from "../../../aplicacion/aperturaVacante/actualizarAperturaVacante.js";
import { eliminarAperturaVacante } from "../../../aplicacion/aperturaVacante/eliminarAperturaVacante.js";
import { crearRetiroPracticante } from "../../../aplicacion/retirarPracticante/crearRetiro";


// ============================================================
// FORMATO DE CERTIFICADO (descargable)
// Pon aquí la URL o ruta del formato. Si lo dejas vacío,
// el botón "Descargar formato" no se muestra.
// ============================================================

const FORMATO_CERTIFICADO_URL = "";


// ============================================================
// HELPERS DE ESTADO
// ============================================================

const normalizarEstado = (estado) =>
  String(estado ?? "")
    .trim()
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\s+/g, " ");

const estaEnCurso = (p) => normalizarEstado(p.estado) === "en curso";
const estaFinalizado = (p) => normalizarEstado(p.estado) === "finalizada";
const estaRetirado = (p) =>
  ["retirado", "cancelado"].includes(normalizarEstado(p.estado));

const certificadoVacio = {
  open: false,
  practicante: null,
  certificado: null,
  loading: false,
  subiendo: false,
};


const GrupoPracticaDetalle = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  // ---------- Detalle ----------
  const [grupo, setGrupo] = useState(null);
  const [loadingGrupo, setLoadingGrupo] = useState(true);
  const [errorGrupo, setErrorGrupo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ---------- Datos para crear apertura ----------
  const [vacantesEmpresa, setVacantesEmpresa] = useState([]);
  const [tutoresEmpresariales, setTutoresEmpresariales] = useState([]);

  // ---------- Carrusel ----------
  const scrollRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  // ---------- Modales de aperturas ----------
  const [aperturaModal, setAperturaModal] = useState({
    isOpen: false,
    mode: "crear",
    apertura: null,
  });
  const [aperturaAEliminar, setAperturaAEliminar] = useState(null);

  // ---------- Modales de practicantes ----------
  const [encuestaModal, setEncuestaModal] = useState({
    isOpen: false,
    practicante: null,
  });

  const [eliminandoApertura, setEliminandoApertura] = useState(false);

  const [openRetiroModal, setOpenRetiroModal] = useState(false);
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);

  const [verRetiroPracticante, setVerRetiroPracticante] = useState(null);

  const [certificadoModal, setCertificadoModal] = useState(certificadoVacio);


  // ============================================================
  // DERIVADOS
  // ============================================================

  const practicantes = useMemo(
    () => (Array.isArray(grupo?.practicantes) ? grupo.practicantes : []),
    [grupo]
  );

  const aperturas = useMemo(
    () => (Array.isArray(grupo?.aperturas) ? grupo.aperturas : []),
    [grupo]
  );

  const vacantesDisponibles = useMemo(() => {
    const vacantesUsadas = new Set(
      aperturas.map((apertura) => apertura.vacante_id)
    );

    return vacantesEmpresa.filter(
      (vacante) => !vacantesUsadas.has(vacante.id)
    );
  }, [vacantesEmpresa, aperturas]);

  const vacantesParaModal = useMemo(() => {
    if (aperturaModal.mode === "editar" && aperturaModal.apertura) {
      return vacantesEmpresa.filter(
        (vacante) =>
          !aperturas.some(
            (apertura) =>
              apertura.vacante_id === vacante.id &&
              apertura.id !== aperturaModal.apertura.id
          )
      );
    }

    return vacantesDisponibles;
  }, [vacantesEmpresa, vacantesDisponibles, aperturas, aperturaModal]);

  const practicaFinalizada =
    normalizarEstado(grupo?.practica?.estado) === "finalizada";

  const buscarPracticante = (practicanteId) =>
    practicantes.find((p) => p.practicante_id === practicanteId);


  // ============================================================
  // CARGA DE DATOS
  // ============================================================

  const cargarDetalleGrupo = async () => {
    try {
      setLoadingGrupo(true);
      setErrorGrupo("");

      const response = await obtenerDetalleGrupoEmpresa(EmpresaRepository, id);
      setGrupo(response?.data ?? null);

    } catch (error) {
      console.error("Error al obtener detalle del grupo:", error);
      setErrorGrupo(
        error?.response?.data?.message ||
        "No fue posible cargar el detalle del grupo."
      );
    } finally {
      setLoadingGrupo(false);
    }
  };

  const cargarDatosApertura = async () => {
    try {
      const [vacantesData, tutoresData] = await Promise.all([
        getVacantesByEmpresa(vacanteRepository),
        getTutorEmpresariales({ tutorEmpresarialRepository }),
      ]);

      setVacantesEmpresa(Array.isArray(vacantesData) ? vacantesData : []);
      setTutoresEmpresariales(Array.isArray(tutoresData) ? tutoresData : []);

    } catch (error) {
      console.error("Error al cargar datos para apertura:", error);
    }
  };

  useEffect(() => {
    if (id) cargarDetalleGrupo();
  }, [id]);

  useEffect(() => {
    cargarDatosApertura();
  }, []);


  // ============================================================
  // CARRUSEL DE APERTURAS
  // ============================================================

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;
    setHasOverflow(el.scrollWidth > el.clientWidth + 1);
  };

  const scrollAperturas = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [aperturas]);


  // ============================================================
  // APERTURAS
  // ============================================================

  const abrirCrearApertura = () => {
    if (practicaFinalizada) {
      toast.error("No se pueden crear aperturas en una práctica finalizada");
      return;
    }
    setAperturaModal({ isOpen: true, mode: "crear", apertura: null });
  };

  const abrirEditarApertura = (apertura) => {
    if (practicaFinalizada) {
      toast.error("No se pueden editar aperturas en una práctica finalizada");
      return;
    }
    setAperturaModal({ isOpen: true, mode: "editar", apertura });
  };

  const cerrarAperturaModal = () => {
    setAperturaModal({ isOpen: false, mode: "crear", apertura: null });
  };

  const handleGuardarApertura = async (data) => {
    try {
      if (aperturaModal.mode === "crear") {
        await crearAperturaVacante(aperturaVacanteRepository, {
          ...data,
          practica_id: grupo.practica.id,
        });
        toast.success("Apertura de vacante creada correctamente");
      } else {
        await actualizarAperturaVacante(
          aperturaVacanteRepository,
          aperturaModal.apertura.id,
          data
        );
        toast.success("Apertura de vacante actualizada correctamente");
      }

      cerrarAperturaModal();
      await cargarDetalleGrupo();

    } catch (error) {
      console.error("Error al guardar apertura:", error);
      toast.error(
        error?.response?.data?.message ||
        "No fue posible guardar la apertura de vacante."
      );
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!aperturaAEliminar || eliminandoApertura) return;

    try {
      setEliminandoApertura(true);

      await eliminarAperturaVacante(
        aperturaVacanteRepository,
        aperturaAEliminar.id
      );

      toast.success("Apertura de vacante eliminada correctamente");

      setAperturaAEliminar(null);
      await cargarDetalleGrupo();

    } catch (error) {
      console.error("Error al eliminar apertura:", error);

      toast.error(
        error?.response?.data?.message ||
        "No fue posible eliminar la apertura de vacante."
      );

    } finally {
      setEliminandoApertura(false);
    }
  };

  // ============================================================
  // ENCUESTA
  // ============================================================

  const handleEncuesta = (practicante) => {
    setEncuestaModal({
      isOpen: true,
      practicante: {
        id_practicante: practicante.practicante_id,
        nombre: `${practicante.nombres ?? ""} ${practicante.apellidos ?? ""}`.trim(),
      },
    });
  };

  const handleCerrarEncuesta = () => {
    setEncuestaModal({ isOpen: false, practicante: null });
  };


  // ============================================================
  // RETIRAR PRACTICANTE
  // ============================================================

  const handleAbrirRetiro = (practicante) => {
    if (!estaEnCurso(practicante)) {
      toast.error("Solo se pueden retirar practicantes en curso.");
      return;
    }
    setPracticanteSeleccionado(practicante);
    setOpenRetiroModal(true);
  };

  const handleCerrarRetiro = () => {
    setOpenRetiroModal(false);
    setPracticanteSeleccionado(null);
  };

  const handleRetirar = async ({ motivo, archivo }) => {
    if (!practicanteSeleccionado || !estaEnCurso(practicanteSeleccionado)) {
      toast.error("Solo se pueden retirar practicantes en curso.");
      return;
    }

    try {
      await crearRetiroPracticante(
        { retiroPracticanteRepository },
        {
          motivo,
          practicante_id: practicanteSeleccionado.practicante_id,
          archivo,
        }
      );
    } catch (error) {
      console.error("Error al retirar al practicante:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Error al retirar al practicante."
      );
      return; // el modal queda abierto para reintentar
    }

    toast.success("El practicante fue retirado correctamente.");
    handleCerrarRetiro();
    await cargarDetalleGrupo();
  };


  // ============================================================
  // VER RETIRO (practicantes Retirado / Cancelado)
  // ============================================================

  // El retiro ya viene dentro de cada practicante (practicante.retiro)
  const handleVerRetiro = (practicante) => setVerRetiroPracticante(practicante);

  const handleCerrarVerRetiro = () => setVerRetiroPracticante(null);


  // ============================================================
  // CERTIFICADO (practicantes Finalizada)
  // ============================================================

  // Backend responde { success, data } y el repositorio devuelve la respuesta de axios
  const consultarCertificado = async (practicanteId) => {
    const response = await obtenerCertificadoFinalizacion(
      EmpresaRepository,
      practicanteId
    );

    return response?.data?.data ?? null;
  };

  const handleAbrirCertificado = async (practicante) => {
    setCertificadoModal({
      open: true,
      practicante,
      certificado: null,
      loading: true,
      subiendo: false,
    });

    try {
      const certificado = await consultarCertificado(
        practicante.practicante_id
      );

      setCertificadoModal((s) => ({
        ...s,
        certificado,
        loading: false,
      }));

    } catch (error) {
      // 404 = todavía no hay certificado: el modal queda abierto para subirlo
      if (error?.response?.status !== 404) {
        console.error("Error al obtener el certificado:", error);
        toast.error("No fue posible cargar el certificado.");
      }
      setCertificadoModal((s) => ({ ...s, certificado: null, loading: false }));
    }
  };

  const handleSubirCertificado = async (archivo) => {
    const { practicante } = certificadoModal;
    if (!practicante || !archivo) return;

    try {
      setCertificadoModal((s) => ({ ...s, subiendo: true }));

      await subirCertificadoFinalizacion(
        EmpresaRepository,
        practicante.practicante_id,
        archivo
      );

      // Se vuelve a consultar para mostrar lo que quedó guardado
      const certificado = await consultarCertificado(
        practicante.practicante_id
      );

      toast.success("Certificado subido correctamente");

      setCertificadoModal((s) => ({
        ...s,
        certificado,
        subiendo: false,
      }));

    } catch (error) {
      console.error("Error al subir el certificado:", error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "No fue posible subir el certificado."
      );
      setCertificadoModal((s) => ({ ...s, subiendo: false }));
    }
  };

  const handleCerrarCertificado = () => {
    if (certificadoModal.subiendo) return;
    setCertificadoModal(certificadoVacio);
  };


  // ============================================================
  // ESTADOS DE CARGA
  // ============================================================

  if (loadingGrupo && !grupo) {
    return (
      <GrupoPracticaDetalleSkeleton />
    );
  }

  if (errorGrupo) {
    return (
      <div className="text-center py-10 text-red-500 font-medium">
        {errorGrupo}
      </div>
    );
  }

  if (!grupo) {
    return (
      <div className="text-center py-10 text-slate-500">
        No se encontró el grupo.
      </div>
    );
  }


  return (
    <div>

      {/* HEADER */}
      <div className="relative flex items-center justify-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="
            absolute left-0
            flex items-center gap-2
            text-slate-600 hover:text-slate-900
            font-medium text-sm
            px-3 py-2 rounded-md
            hover:bg-slate-100
            transition-colors
          "
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>


      {/* PERIODO / ESTADO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 max-w-5xl mx-auto">

        <div className="text-center md:text-left">
          <p className="text-sm font-semibold text-slate-600 mb-1">
            Periodo Lectivo
          </p>
          <p className="text-2xl font-extrabold text-slate-800">
            {grupo.practica?.periodo ?? "—"}
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate-600 mb-1">Estado</p>
          <EstadoBadge estado={grupo.practica?.estado} size="lg" />
        </div>

      </div>


      {/* PRACTICANTES */}
      <h2 className="text-2xl font-extrabold text-slate-800 text-center mb-4">
        Practicantes
      </h2>

      <div className="max-w-5xl mx-auto mb-12 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">

        <GenericTable
          rows={practicantes}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          rowKey="practicante_id"

          columns={[
            {
              key: "nombres",
              label: "Nombre",
              primary: true,
              render: (row) =>
                `${row.nombres ?? ""} ${row.apellidos ?? ""}`.trim() || "—",
            },
            {
              key: "apertura",
              label: "Vacante",
              render: (row) => row.apertura?.vacante ?? "—",
            },
            {
              key: "correo",
              label: "Correo",
              render: (row) => row.correo ?? "—",
            },
            {
              key: "estado",
              label: "Estado",
              render: (row) => <EstadoBadge estado={row.estado} />,
            },
          ]}

          actions={[
            {
              icon: <Eye size={18} />,
              className: "text-blue-600 hover:bg-blue-100",
              title: "Ver informes",
              onClick: (pid) => {
                const p = buscarPracticante(pid);
                if (!p) return;

                navigate(`/informes/${p.practicante_id}/consulta`, {
                  state: {
                    practicante: {
                      id: p.practicante_id,
                      nombre: `${p.nombres ?? ""} ${p.apellidos ?? ""}`.trim(),
                      correo: p.correo,
                      estado: p.estado,
                    },
                  },
                });
              },
              disabled: (row) => !estaEnCurso(row),
              disabledTitle: "Solo se pueden consultar informes de practicantes en curso",
            },
            {
              icon: <UserX size={18} />,
              className: "text-red-500 hover:bg-red-100",
              title: "Retirar practicante",
              onClick: (pid) => {
                const p = buscarPracticante(pid);
                if (p) handleAbrirRetiro(p);
              },
              disabled: (row) => !estaEnCurso(row),
              disabledTitle: "Solo se pueden retirar practicantes en curso",
            },
            {
              icon: <ClipboardList size={18} />,
              className: "text-amber-600 hover:bg-amber-100",
              title: "Encuesta",
              onClick: (pid) => {
                const p = buscarPracticante(pid);
                if (p) handleEncuesta(p);
              },
              disabled: (row) => !estaEnCurso(row),
              disabledTitle: "Solo está disponible para practicantes en curso",
            },
            {
              icon: <FileText size={18} />,
              className: "text-rose-600 hover:bg-rose-100",
              title: "Ver retiro",
              onClick: (pid) => {
                const p = buscarPracticante(pid);
                if (p) handleVerRetiro(p);
              },
              disabled: (row) => !estaRetirado(row),
              disabledTitle: "Solo disponible para practicantes retirados o cancelados",
            },
            {
              icon: <Award size={18} />,
              className: "text-emerald-600 hover:bg-emerald-100",
              title: "Certificado",
              onClick: (pid) => {
                const p = buscarPracticante(pid);
                if (p) handleAbrirCertificado(p);
              },
              disabled: (row) => estaRetirado(row),
              disabledTitle: "No disponible para practicantes retirados o cancelados",
            },
          ]}

          emptyMessage="No hay practicantes registrados."
          pageSize={3}
        />

      </div>


      {/* APERTURAS DE VACANTE */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">

        <h2 className="text-2xl font-extrabold text-slate-800">
          Aperturas de Vacante
        </h2>

        <button
          onClick={abrirCrearApertura}
          disabled={practicaFinalizada || vacantesDisponibles.length === 0}
          className={`
    flex items-center gap-1.5
    px-3 py-1.5 rounded-lg
    text-sm font-semibold
    transition-colors
    ${practicaFinalizada || vacantesDisponibles.length === 0
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
            }
  `}
          title={
            practicaFinalizada
              ? "No se pueden crear aperturas en una práctica finalizada"
              : vacantesDisponibles.length === 0
                ? "No hay vacantes disponibles para asignar"
                : "Crear apertura"
          }
        >
          {vacantesDisponibles.length === 0 ? (
            <>
              <ClipboardList size={16} />
              Sin vacantes disponibles
            </>
          ) : (
            <>
              <Plus size={16} />
              Agregar apertura vacante
            </>
          )}
        </button>

      </div>

      <div className="max-w-5xl mx-auto mb-16">

        {aperturas.length === 0 ? (

          <div className="border-2 border-dashed border-slate-200 rounded-2xl py-10 text-center text-slate-400 text-sm">
            No hay aperturas registradas todavía.
          </div>

        ) : (

          <div className="relative flex items-center gap-2">

            {hasOverflow && (
              <button
                onClick={() => scrollAperturas("left")}
                className="hidden sm:flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:bg-slate-50"
                aria-label="Anterior"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div
              ref={scrollRef}
              className={`
                flex gap-5 overflow-x-auto scroll-smooth
                snap-x snap-mandatory py-1 flex-1
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                ${hasOverflow ? "" : "justify-center"}
              `}
            >
              {aperturas.map((apertura) => (

                <div
                  key={apertura.id}
                  className="snap-start shrink-0 w-[270px] border-2 border-red-200 rounded-2xl p-5 bg-white shadow-sm flex flex-col justify-between"
                >

                  <div className="space-y-1">
                    <p className="font-bold text-slate-800 mb-2">
                      {apertura.vacante ?? "Vacante"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Práctica: {grupo.practica?.periodo ?? "—"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Cupos: {apertura.cupos}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      Estado: <EstadoBadge estado={apertura.estado} size="sm" />
                    </div>

                    <p className="text-sm text-slate-500">
                      Tutor: {apertura.tutor_empresarial ?? "Sin asignar"}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">

                    <button
                      onClick={() => abrirEditarApertura(apertura)}
                      disabled={practicaFinalizada}
                      className={`p-1.5 rounded-md ${practicaFinalizada
                        ? "text-slate-300 cursor-not-allowed"
                        : "hover:bg-blue-100 text-blue-500"}`}
                      title={
                        practicaFinalizada
                          ? "No se puede editar una práctica finalizada"
                          : "Editar apertura"
                      }
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={() => setAperturaAEliminar(apertura)}
                      disabled={practicaFinalizada}
                      className={`p-1.5 rounded-md ${practicaFinalizada
                        ? "text-slate-300 cursor-not-allowed"
                        : "hover:bg-red-100 text-red-500"}`}
                      title={
                        practicaFinalizada
                          ? "No se puede eliminar una práctica finalizada"
                          : "Eliminar apertura"
                      }
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>

              ))}
            </div>

            {hasOverflow && (
              <button
                onClick={() => scrollAperturas("right")}
                className="hidden sm:flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md text-slate-500 hover:bg-slate-50"
                aria-label="Siguiente"
              >
                <ChevronRight size={20} />
              </button>
            )}

          </div>

        )}

      </div>


      {/* MODALES */}
      <AperturaVacanteModal
        isOpen={aperturaModal.isOpen}
        mode={aperturaModal.mode}
        initialData={aperturaModal.apertura}
        vacantes={vacantesParaModal}
        practica={grupo.practica}
        tutores={tutoresEmpresariales}
        aperturas={aperturas}
        onClose={cerrarAperturaModal}
        onSave={handleGuardarApertura}
      />

      <ConfirmModal
        isOpen={!!aperturaAEliminar}
        title="Eliminar apertura"
        message="¿Seguro que desea eliminar esta apertura de vacante?"
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        confirmColor="bg-red-600 hover:bg-red-700"
        loading={eliminandoApertura}
        onCancel={() => setAperturaAEliminar(null)}
        onConfirm={handleConfirmarEliminar}
      />

      <EncuestaTutorEmpresarialModal
        mostrar={encuestaModal.isOpen}
        practicante={encuestaModal.practicante}
        rolEncuesta="Empresa"
        onCerrar={handleCerrarEncuesta}
      />

      <RetirarPracticanteModal
        open={openRetiroModal}
        practicante={practicanteSeleccionado}
        onClose={handleCerrarRetiro}
        onRetirar={handleRetirar}
        mostrarDatosVacante
      />

      <VerRetiroModal
        open={!!verRetiroPracticante}
        practicante={verRetiroPracticante}
        onClose={handleCerrarVerRetiro}
      />

      <CertificadoPracticanteModal
        open={certificadoModal.open}
        practicante={certificadoModal.practicante}
        certificado={certificadoModal.certificado}
        loading={certificadoModal.loading}
        subiendo={certificadoModal.subiendo}
        formatoUrl={FORMATO_CERTIFICADO_URL}
        onSubir={handleSubirCertificado}
        onClose={handleCerrarCertificado}
      />

    </div>
  );
};

export default GrupoPracticaDetalle;