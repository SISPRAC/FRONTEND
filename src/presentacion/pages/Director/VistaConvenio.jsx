import { useState, useEffect } from "react";
import Layout from "../../shared/Layouts/Layout";

import { useLocation } from "react-router-dom";
import { getConvenio } from "../../../aplicacion/convenio/getConvenio";
import { convenioRepository } from "../../../infraestructura/repository/convenioRepository";
import { historialConvenioRepository } from "../../../infraestructura/repository/historialConvenioRepository";
import { registrarHistorialConvenio } from "../../../aplicacion/historialConvenio/registrarHistorialConvenio.js";
import { actualizarEstadoConvenio } from "../../../aplicacion/convenio/actualizarEstado.js"
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import { Check, X, MessageSquare, Download } from "lucide-react";
import ConfirmModal from "../../components/modals/DeleteModal.jsx";
import toast from "react-hot-toast";

function getUsuarioSesion() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.error("No se pudo leer el usuario de localStorage:", error);
    return null;
  }
}

export default function VistaConvenio() {

  const location = useLocation();

  const id = location.state?.convenioId;

  const [convenio, setConvenio] = useState(null);

  const [comentario, setComentario] = useState("");
  const [accionLocal, setAccionLocal] = useState(null);
  const [modalAccion, setModalAccion] = useState(null);

  const estadoActual = accionLocal || convenio?.estado;

  const esFinal =
    estadoActual === "APROBADO" ||
    estadoActual === "RECHAZADO";

  const usuarioSesion = getUsuarioSesion();

  const handleAprobar = async () => {
    try {

      if (!comentario.trim()) {
        toast.error("Debe ingresar un comentario");
        return;
      }

      if (!usuarioSesion?.id) {
        toast.error("No se encontró el usuario de la sesión");
        return;
      }

      await actualizarEstadoConvenio(
        {
          convenioRepository
        },
        convenio.id,
        {
          estado: "APROBADO",
          comentario,
          usuario_id: usuarioSesion.id
        }
      );

      setAccionLocal("APROBADO");
      toast.success("Convenio aprobado");
      setComentario("");

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error aprobando convenio"
      );

    }
  };

  const handleRechazar = async () => {
    try {

      if (!comentario.trim()) {
        toast.error("Debe ingresar un comentario");
        return;
      }

      if (!usuarioSesion?.id) {
        toast.error("No se encontró el usuario de la sesión");
        return;
      }

      await actualizarEstadoConvenio(
        {
          convenioRepository
        },
        convenio.id,
        {
          estado: "RECHAZADO",
          comentario,
          usuario_id: usuarioSesion.id
        }
      );

      setAccionLocal("RECHAZADO");
      toast.success("Convenio rechazado");
      setComentario("");

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error rechazando convenio"
      );

    }
  };
  const handleHistorial = async () => {
    try {

      if (!comentario.trim()) {
        toast.error("Debe ingresar un comentario");
        return;
      }

      if (!usuarioSesion?.id) {
        toast.error("No se encontró el usuario de la sesión");
        return;
      }

      const ahora = new Date().toLocaleString("sv-SE", {
        timeZone: "America/Bogota"
      }).replace("T", " ");

      const historial = {
        convenio_id: convenio.id,
        archivo_id: convenio.idArchivo,
        accion: "OBSERVACION",
        fecha: ahora,
        comentario,
        usuario_id: usuarioSesion.id
      };

      await registrarHistorialConvenio(
        {
          historialConvenioRepository
        },
        historial
      );

      toast.success("Observación registrada correctamente");
      setComentario("");

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "No se pudo registrar la observación"
      );
    }
  };


  useEffect(() => {
    if (id) {
      cargarConvenio();
    }
  }, [id]);


  const cargarConvenio = async () => {
    try {
      const data = await getConvenio(
        {
          convenioRepository
        },
        id
      );

      console.log(data);

      setConvenio(data);
      setComentario(data.comentario ?? "");

    } catch (error) {
      console.error(error);
      console.log("error del cargarConvenio:" + error.message);
    }

  };

  if (!convenio) {
    return (
      <Layout

        footerLabel="Director"
      >
        <div className="p-5 text-gray-500">
          Cargando convenio...
        </div>
      </Layout >
    );
  }

  return (
    <Layout footerLabel="Director">
      {/* Contenedor que llena el alto del Layout  sin scroll de página */}
      <div className="flex flex-col h-full overflow-hidden p-5 gap-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Convenio</h1>
            <p className="text-sm text-gray-400 mt-0.5">{convenio.empresa}</p>
          </div>
          <EstadoBadge estado={accionLocal || convenio.estado} size="lg" />
        </div>

        {/* Cuerpo: dos columnas, ocupan el resto del alto */}
        <div className="flex gap-4 flex-1 min-h-0">

          {/* ── Columna izquierda: visor + plantilla ── */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Visor de documento */}
            <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white min-h-0">

              {/* Toolbar */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-gray-500 truncate min-w-0">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="truncate">Convenio_{convenio.empresa}.pdf</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {convenio.archivo && (
                    <a
                      href={convenio.archivo}
                      download
                      className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                    >
                      <Download size={14} />
                      Descargar
                    </a>
                  )}
                </div>
              </div>

              {/* Área scrolleable del PDF / preview */}
              <div className="flex-1 overflow-y-auto bg-gray-100 p-4 min-h-0">
                {convenio.archivo ? (
                  <iframe
                    src={convenio.archivo}
                    title="Convenio PDF"
                    className="w-full h-full rounded border border-gray-200"
                    style={{ minHeight: "100%" }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No hay documento disponible
                  </div>
                )}
              </div>
            </div>

            {/* Plantilla oficial — franja sutil */}

          </div>

          {/* ── Columna derecha: detalles + comentario + botones ── */}
          <div className="w-64 flex-shrink-0 flex flex-col gap-3 min-h-0">

            {/* Detalles */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Detalles</p>
              <div className="space-y-2">
                {[
                  { label: "Empresa", value: convenio.empresa },
                  { label: "Recibido", value: convenio.fechaEnvio },
                  { label: "Vigencia", value: convenio.fechaFin },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-baseline gap-2 text-sm">
                    <span className="text-gray-400 flex-shrink-0">{label}</span>
                    <span className="text-gray-800 font-medium text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Comentario — ocupa el espacio restante */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 flex-1 min-h-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0">Tu comentario</p>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                disabled={esFinal}
                placeholder={
                  esFinal
                    ? "Convenio finalizado, solo lectura"
                    : "Escribe tu observación antes de aprobar o rechazar..."
                }
                className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-0"
              />
              {comentario.length > 0 && !esFinal && (
                <p className="text-xs text-gray-300 text-right flex-shrink-0">{comentario.length} caracteres</p>
              )}
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              {esFinal ? (
                <div
                  className={`text-center text-sm font-medium rounded-xl px-4 py-3 border ${estadoActual === "APROBADO"
                    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                    : "text-red-600 bg-red-50 border-red-200"
                    }`}
                >

                  {
                    estadoActual === "APROBADO"
                      ? "✓ Convenio aprobado"
                      : "✕ Convenio rechazado"
                  }

                </div>
              ) : (
                <>
                  <button
                    onClick={() => setModalAccion("APROBADO")}
                    className="flex items-center justify-center gap-2 bg-[#e8192c] hover:bg-[#c8111f] 
                    active:scale-95 text-white text-sm font-medium rounded-xl px-5 py-2.5 transition-all w-full"
                  >
                    <Check />
                    Aprobar convenio
                  </button>
                  <button
                    onClick={handleHistorial}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 
                    active:scale-95 text-gray-700 text-sm font-medium rounded-xl px-5 py-2.5 transition-all w-full "
                  >
                    <MessageSquare size={18} />
                    Comentar
                  </button>
                  <button
                    onClick={() => setModalAccion("RECHAZADO")}
                    className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 
                    active:scale-95 text-gray-700 text-sm font-medium rounded-xl px-5 py-2.5 transition-all w-full"
                  >
                    <X />
                    Rechazar convenio
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
      <ConfirmModal

        isOpen={modalAccion !== null}

        onClose={() => setModalAccion(null)}

        title={
          modalAccion === "APROBADO"
            ? "¿Aprobar convenio?"
            : "¿Rechazar convenio?"
        }


        message={
          modalAccion === "APROBADO"
            ? "Al aprobar el convenio se registrará la decisión y quedará finalizado."
            : "Al rechazar el convenio se registrará la decisión y no podrá continuar el proceso."
        }


        confirmText={
          modalAccion === "APROBADO"
            ? "Aprobar"
            : "Rechazar"
        }


        onConfirm={() => {


          if (modalAccion === "APROBADO") {
            handleAprobar();
          }


          if (modalAccion === "RECHAZADO") {
            handleRechazar();
          }


          setModalAccion(null);

        }}

      />
    </Layout >
  );
}
