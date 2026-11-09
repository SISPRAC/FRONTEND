import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Check,
  X,
  MessageSquare,
  Download,
  ChevronLeft,
  ClipboardList,
  FileText,
  Lock,
  UploadCloud,
  CheckCircle2,
  Archive,
} from "lucide-react";
import toast from "react-hot-toast";

import { getConvenio } from "../../../aplicacion/convenio/getConvenio";
import { convenioRepository } from "../../../infraestructura/repository/convenioRepository";
import { historialConvenioRepository } from "../../../infraestructura/repository/historialConvenioRepository";
import { registrarHistorialConvenio } from "../../../aplicacion/historialConvenio/registrarHistorialConvenio.js";
import { actualizarEstadoConvenio } from "../../../aplicacion/convenio/actualizarEstado.js";

import { empresaRequisitoDocumentoRepository } from "../../../infraestructura/repository/empresaRequisitoDocumentoRepository";
import { obtenerRevisionRequisitosEmpresa } from "../../../aplicacion/empresaRequisitoDocumento/obtenerRevisionRequisitosEmpresa";
import { revisarDocumentoConvenioEmpresa } from "../../../aplicacion/empresaRequisitoDocumento/revisarDocumentoConvenioEmpresa";
import { aprobarConvenio } from "../../../aplicacion/convenio/aprobarConvenio";

import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import ConfirmModal from "../../components/modals/DeleteModal.jsx";

// ===============================================================
// UTILIDADES
// ===============================================================

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

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const MAX_MB_FIRMADO = 2;
const MAX_BYTES_FIRMADO = MAX_MB_FIRMADO * 1024 * 1024;

// Ajusta el PDF al ancho del visor y oculta el panel lateral de miniaturas
const conParametrosPDF = (url) => {
  if (!url) return url;
  if (url.includes("#")) return url;
  return `${url}#view=FitH&navpanes=0`;
};

// ===============================================================
// VISOR PDF
// ===============================================================

function VisorPDF({ url, titulo, vacio = "No hay documento disponible" }) {
  return (
    <div className="flex-1 min-h-0 bg-gray-100">
      {url ? (
        <iframe
          key={url}
          src={conParametrosPDF(url)}
          title={titulo}
          className="w-full h-full border-0 bg-white"
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400 text-sm">
          <FileText size={28} />
          {vacio}
        </div>
      )}
    </div>
  );
}

// ===============================================================
// COMPONENTE PRINCIPAL
// ===============================================================

export default function VistaConvenio() {
  const location = useLocation();
  const navigate = useNavigate();

  const id = location.state?.convenioId;
  const usuarioSesion = getUsuarioSesion();

  const [convenio, setConvenio] = useState(null);
  const [paso, setPaso] = useState("requisitos");

  // ---------- REQUISITOS ----------
  const [requisitos, setRequisitos] = useState([]);
  const [cargandoReq, setCargandoReq] = useState(true);
  const [seleccionadoId, setSeleccionadoId] = useState(null);
  const [comentarioReq, setComentarioReq] = useState("");
  const [modalReq, setModalReq] = useState(null);
  const [enviandoReq, setEnviandoReq] = useState(false);
  const [descargandoTodo, setDescargandoTodo] = useState(false);

  // ---------- CONVENIO ----------
  const [comentario, setComentario] = useState("");
  const [archivoFinal, setArchivoFinal] = useState(null);
  const [previewFinal, setPreviewFinal] = useState(null);
  const [vista, setVista] = useState("borrador");
  const [modalAccion, setModalAccion] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // ===============================================================
  // CARGAS
  // ===============================================================

  useEffect(() => {
    if (id) cargarConvenio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (convenio?.empresaId) cargarRequisitos(convenio.empresaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convenio?.empresaId]);

  useEffect(() => {
    return () => {
      if (previewFinal) URL.revokeObjectURL(previewFinal);
    };
  }, [previewFinal]);

  const cargarConvenio = async () => {
    try {
      const data = await getConvenio({ convenioRepository }, id);
      setConvenio(data);
      setComentario(data.comentario ?? "");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo cargar el convenio");
    }
  };

  const cargarRequisitos = async (empresaId) => {
    try {
      setCargandoReq(true);

      const data = await obtenerRevisionRequisitosEmpresa(
        { empresaRequisitoDocumentoRepository },
        empresaId
      );

      setRequisitos(data || []);
      setSeleccionadoId((actual) => actual ?? data?.[0]?.tipo?.id ?? null);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los requisitos de la empresa");
    } finally {
      setCargandoReq(false);
    }
  };

  // ===============================================================
  // DERIVADOS
  // ===============================================================

  const seleccionado = useMemo(
    () => requisitos.find((r) => r.tipo.id === seleccionadoId) || null,
    [requisitos, seleccionadoId]
  );

  const obligatorios = requisitos.filter((r) => r.tipo.obligatorio);
  const aprobados = obligatorios.filter(
    (r) => r.documento?.estado === "APROBADO"
  ).length;

  const requisitosCompletos =
    obligatorios.length > 0 && aprobados === obligatorios.length;

  const estadoConvenio = convenio?.estado;
  const esFinal =
    estadoConvenio === "APROBADO" || estadoConvenio === "RECHAZADO";

  const docSel = seleccionado?.documento || null;
  const puedeRevisarReq = docSel?.estado === "PENDIENTE";

  useEffect(() => {
    setComentarioReq(docSel?.observacion || "");
  }, [seleccionadoId, docSel?.observacion]);

  // ===============================================================
  // REVISAR REQUISITO
  // ===============================================================

  const handleRevisarRequisito = async () => {
    const estado = modalReq;
    setModalReq(null);

    if (!docSel) return;

    // El motivo solo es obligatorio al rechazar
    if (estado === "RECHAZADO" && !comentarioReq.trim()) {
      toast.error("Debes escribir un motivo para rechazar");
      return;
    }

    setEnviandoReq(true);

    try {
      await revisarDocumentoConvenioEmpresa(
        { empresaRequisitoDocumentoRepository },
        docSel.id,
        { estado, observacion: comentarioReq.trim() }
      );

      toast.success(
        estado === "APROBADO" ? "Documento aprobado" : "Documento rechazado"
      );

      await cargarRequisitos(convenio.empresaId);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "No se pudo registrar la revisión"
      );
    } finally {
      setEnviandoReq(false);
    }
  };

  // ===============================================================
  // DESCARGAR TODOS LOS REQUISITOS (ZIP)
  // ===============================================================

  const documentosDescargables = requisitos.filter(
    (r) => r.documento?.archivo?.url
  );

  const limpiarNombre = (texto) =>
    String(texto || "documento")
      .replace(/[\\/:*?"<>|]+/g, "")
      .trim();

  const handleDescargarTodos = async () => {
    if (!requisitosCompletos) {
      toast.error(
        "Todos los documentos obligatorios deben estar aprobados para descargar"
      );
      return;
    }

    if (documentosDescargables.length === 0) {
      toast.error("No hay documentos para descargar");
      return;
    }

    setDescargandoTodo(true);

    try {
      // Requiere: npm i jszip
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      await Promise.all(
        documentosDescargables.map(async ({ tipo, documento }) => {
          const url = documento.archivo.url;
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`No se pudo descargar ${tipo.nombre}`);
          const blob = await resp.blob();

          const ext =
            (url.split("?")[0].match(/\.([a-z0-9]+)$/i) || [])[1] || "pdf";

          zip.file(`${limpiarNombre(tipo.nombre)}.${ext}`, blob);
        })
      );

      const contenido = await zip.generateAsync({ type: "blob" });
      const href = URL.createObjectURL(contenido);

      const a = document.createElement("a");
      a.href = href;
      a.download = `requisitos-${limpiarNombre(convenio?.empresa)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);

      toast.success("Descarga lista");
    } catch (error) {
      console.error(error);
      toast.error(
        "No se pudo generar el ZIP. Verifica que el servidor de archivos permita CORS."
      );
    } finally {
      setDescargandoTodo(false);
    }
  };

  // ===============================================================
  // ARCHIVO FIRMADO
  // ===============================================================

  const handleSeleccionarFinal = (file) => {
    if (!file) return;

    const esPDF =
      file.type === "application/pdf" &&
      file.name.toLowerCase().endsWith(".pdf");

    if (!esPDF) {
      toast.error("Solo se permiten archivos en formato PDF");
      return;
    }

    if (file.size > MAX_BYTES_FIRMADO) {
      toast.error(`El archivo no puede superar los ${MAX_MB_FIRMADO} MB`);
      return;
    }

    if (previewFinal) URL.revokeObjectURL(previewFinal);

    setArchivoFinal(file);
    setPreviewFinal(URL.createObjectURL(file));
    setVista("final");
  };

  const handleQuitarFinal = () => {
    if (previewFinal) URL.revokeObjectURL(previewFinal);
    setArchivoFinal(null);
    setPreviewFinal(null);
    setVista("borrador");
  };

  // ===============================================================
  // APROBAR / RECHAZAR / COMENTAR CONVENIO
  // ===============================================================

  const handleAprobar = async () => {
    if (!archivoFinal) {
      toast.error("Sube el convenio firmado antes de aprobar");
      return;
    }

    if (!usuarioSesion?.id) {
      toast.error("No se encontró el usuario de la sesión");
      return;
    }

    setEnviando(true);

    try {
      const formData = new FormData();
      formData.append("estado", "APROBADO");
      formData.append("comentario", comentario.trim());
      formData.append("usuario_id", usuarioSesion.id);
      formData.append("archivo", archivoFinal);

      await aprobarConvenio({ convenioRepository }, convenio.id, formData);

      toast.success("Convenio aprobado");

      handleQuitarFinal();
      await cargarConvenio();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error aprobando convenio"
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleRechazar = async () => {
    if (!comentario.trim()) {
      toast.error("Debe ingresar un comentario");
      return;
    }

    if (!usuarioSesion?.id) {
      toast.error("No se encontró el usuario de la sesión");
      return;
    }

    setEnviando(true);

    try {
      await actualizarEstadoConvenio({ convenioRepository }, convenio.id, {
        estado: "RECHAZADO",
        comentario,
        usuario_id: usuarioSesion.id,
      });

      toast.success("Convenio rechazado");
      await cargarConvenio();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error rechazando convenio"
      );
    } finally {
      setEnviando(false);
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

      const ahora = new Date()
        .toLocaleString("sv-SE", { timeZone: "America/Bogota" })
        .replace("T", " ");

      await registrarHistorialConvenio(
        { historialConvenioRepository },
        {
          convenio_id: convenio.id,
          archivo_id: convenio.idArchivo,
          accion: "OBSERVACION",
          fecha: ahora,
          comentario,
          usuario_id: usuarioSesion.id,
        }
      );

      toast.success("Observación registrada correctamente");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "No se pudo registrar la observación"
      );
    }
  };

  // ===============================================================
  // CARGANDO
  // ===============================================================

  if (!convenio) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-slate-400 text-sm">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-[#e8192c] rounded-full animate-spin" />
        <span>Cargando...</span>
      </div>
    );
  }

  const urlVisor =
    vista === "final" && previewFinal ? previewFinal : convenio.archivo;

  // ===============================================================
  // RENDER
  // ===============================================================

  return (
    // min-h garantiza altura aunque el padre no tenga una definida.
    // Ajusta "4rem" a la altura de tu navbar/topbar.
    <div className="h-full w-full min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] w-full overflow-hidden p-3 gap-3">

        {/* HEADER + PASOS EN UNA SOLA FILA */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-2.5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 leading-tight">
                Convenio
              </h1>
              <p className="text-xs text-gray-400 truncate">{convenio.empresa}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaso("requisitos")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                paso === "requisitos"
                  ? "bg-[#e8192c] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <ClipboardList size={16} />
              1. Requisitos
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  paso === "requisitos"
                    ? "bg-white/25 text-white"
                    : "bg-white text-slate-500"
                }`}
              >
                {aprobados}/{obligatorios.length}
              </span>
            </button>

            <button
              type="button"
              disabled={!requisitosCompletos && !esFinal}
              onClick={() => setPaso("convenio")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                paso === "convenio"
                  ? "bg-[#e8192c] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {requisitosCompletos || esFinal ? (
                <FileText size={16} />
              ) : (
                <Lock size={16} />
              )}
              2. Convenio
            </button>
          </div>

          <div className="flex justify-end">
            <EstadoBadge estado={estadoConvenio} size="lg" />
          </div>
        </div>

        {/* =====================================================
            PASO 1: REQUISITOS  (lista | visor grande | revisión)
        ===================================================== */}

        {paso === "requisitos" && (
          <div className="flex gap-3 flex-1 min-h-0">

            {/* LISTA */}
            <div className="w-60 flex-shrink-0 flex flex-col gap-2 min-h-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0">
                Documentos de la empresa
              </p>

              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 pr-1">
                {cargandoReq ? (
                  [1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[62px] rounded-xl bg-slate-200 animate-pulse"
                    />
                  ))
                ) : requisitos.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No hay requisitos configurados.
                  </p>
                ) : (
                  requisitos.map(({ tipo, documento }) => {
                    const activo = tipo.id === seleccionadoId;

                    return (
                      <button
                        key={tipo.id}
                        type="button"
                        onClick={() => setSeleccionadoId(tipo.id)}
                        className={`text-left rounded-xl border px-3 py-2.5 transition-colors ${
                          activo
                            ? "border-[#e8192c] bg-red-50/40"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {tipo.nombre}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p className="text-[11px] text-gray-400">
                            {tipo.obligatorio ? "Obligatorio" : "Opcional"}
                          </p>

                          {documento ? (
                            <EstadoBadge estado={documento.estado} />
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap">
                              Sin subir
                            </span>
                          )}
                        </div>

                        {documento?.fecha_subida && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Subido: {formatearFecha(documento.fecha_subida)}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              <button
                type="button"
                onClick={handleDescargarTodos}
                disabled={descargandoTodo}
                className="flex-shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
              >
                <Archive size={16} />
                {descargandoTodo
                  ? "Generando ZIP..."
                  : `Descargar todo (${documentosDescargables.length})`}
              </button>

              {requisitosCompletos && (
                <button
                  type="button"
                  onClick={() => setPaso("convenio")}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-[#e8192c] hover:bg-[#c8111f] text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
                >
                  <CheckCircle2 size={16} />
                  Continuar al convenio
                </button>
              )}
            </div>

            {/* VISOR (ocupa todo el alto disponible) */}
            <div className="flex-1 min-w-0 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                <span className="text-sm text-gray-600 font-medium truncate">
                  {seleccionado?.tipo.nombre || "Selecciona un documento"}
                </span>

                {docSel?.archivo?.url && (
                  <a
                    href={docSel.archivo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <Download size={14} />
                    Abrir
                  </a>
                )}
              </div>

              <VisorPDF
                url={docSel?.archivo?.url}
                titulo={seleccionado?.tipo.nombre || "Documento"}
                vacio={
                  seleccionado
                    ? "La empresa aún no ha subido este documento"
                    : "Selecciona un documento de la lista"
                }
              />
            </div>

            {/* PANEL DE REVISIÓN (columna derecha, ya no le quita alto al visor) */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-2 min-h-0">
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 flex-1 min-h-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0">
                  Revisión
                </p>

                {docSel ? (
                  <>
                    {!puedeRevisarReq && (
                      <div
                        className={`flex-shrink-0 rounded-lg border px-3 py-2 text-sm font-medium ${
                          docSel.estado === "APROBADO"
                            ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                            : "text-red-600 bg-red-50 border-red-200"
                        }`}
                      >
                        {docSel.estado === "APROBADO"
                          ? "✓ Documento aprobado"
                          : "✕ Documento rechazado"}
                        {docSel.estado === "RECHAZADO" && (
                          <span className="block text-[11px] font-normal text-gray-500 mt-0.5">
                            Esperando que la empresa lo reemplace
                          </span>
                        )}
                      </div>
                    )}

                    <textarea
                      value={comentarioReq}
                      onChange={(e) => setComentarioReq(e.target.value)}
                      disabled={!puedeRevisarReq}
                      placeholder={
                        puedeRevisarReq
                          ? "Motivo (obligatorio solo al rechazar)..."
                          : "Sin observaciones"
                      }
                      className="flex-1 min-h-0 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    />

                    {puedeRevisarReq && (
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button
                          onClick={() => setModalReq("APROBADO")}
                          disabled={enviandoReq}
                          className="flex items-center justify-center gap-2 bg-[#e8192c] hover:bg-[#c8111f] disabled:opacity-60 text-white text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
                        >
                          <Check size={16} />
                          Aprobar
                        </button>

                        <button
                          onClick={() => {
                            if (!comentarioReq.trim()) {
                              toast.error("Debes escribir un motivo para rechazar");
                              return;
                            }
                            setModalReq("RECHAZADO");
                          }}
                          disabled={enviandoReq}
                          className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-60 text-gray-700 text-sm font-medium rounded-xl px-4 py-2.5 transition-colors"
                        >
                          <X size={16} />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-xs text-gray-400 px-2">
                    {seleccionado
                      ? "Este documento aún no ha sido subido por la empresa."
                      : "Selecciona un documento para revisarlo."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            PASO 2: CONVENIO
        ===================================================== */}

        {paso === "convenio" && (
          <div className="flex gap-3 flex-1 min-h-0">

            {/* VISOR */}
            <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white min-w-0 min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
                <div className="flex bg-white border border-gray-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setVista("borrador")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      vista === "borrador"
                        ? "bg-[#e8192c] text-white"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {esFinal ? "Documento" : "Borrador de la empresa"}
                  </button>

                  {!esFinal && (
                    <button
                      type="button"
                      disabled={!previewFinal}
                      onClick={() => setVista("final")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        vista === "final"
                          ? "bg-[#e8192c] text-white"
                          : "text-gray-500 hover:text-gray-800"
                      }`}
                    >
                      Versión firmada
                    </button>
                  )}
                </div>

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

              <VisorPDF url={urlVisor} titulo="Convenio PDF" />
            </div>

            {/* PANEL DERECHO (scroll interno si no cabe) */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-3 min-h-0 overflow-y-auto pr-0.5">

              {/* DETALLES */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Detalles
                </p>

                <div className="space-y-2">
                  {[
                    { label: "Empresa", value: convenio.empresa },
                    { label: "Enviado", value: convenio.fechaEnvio },
                    { label: "Inicio", value: convenio.fechaInicio },
                    { label: "Vigencia", value: convenio.fechaFin },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex justify-between items-baseline gap-2 text-sm"
                    >
                      <span className="text-gray-400 flex-shrink-0">{label}</span>
                      <span className="text-gray-800 font-medium text-right truncate">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUBIR FIRMADO */}
              {!esFinal && (
                <div className="bg-white border border-gray-200 rounded-xl p-4 flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                    Convenio firmado
                  </p>

                  {archivoFinal ? (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                      <FileText size={18} className="text-emerald-600 shrink-0" />

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-700 truncate">
                          {archivoFinal.name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {(archivoFinal.size / 1024).toFixed(0)} KB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleQuitarFinal}
                        title="Quitar archivo"
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-red-300 hover:bg-red-50/40 rounded-xl py-4 cursor-pointer transition-colors">
                      <UploadCloud size={22} className="text-gray-700" />
                      <span className="text-xs font-semibold text-gray-700">
                        Subir PDF firmado
                      </span>
                      <span className="text-[11px] text-gray-400 text-center px-2">
                        Solo PDF · máx. {MAX_MB_FIRMADO} MB
                      </span>
                      <span className="text-[11px] text-gray-400 text-center px-2">
                        Reemplazará el borrador al aprobar
                      </span>

                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          handleSeleccionarFinal(e.target.files?.[0]);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  )}
                </div>
              )}

              {/* COMENTARIO */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 flex-1 min-h-[140px]">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex-shrink-0">
                  Tu comentario
                </p>

                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  disabled={esFinal}
                  placeholder={
                    esFinal
                      ? "Convenio finalizado, solo lectura"
                      : "Comentario (obligatorio solo al rechazar o comentar)..."
                  }
                  className="flex-1 w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-0"
                />
              </div>

              {/* ACCIONES */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {esFinal ? (
                  <div
                    className={`text-center text-sm font-medium rounded-xl px-4 py-3 border ${
                      estadoConvenio === "APROBADO"
                        ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }`}
                  >
                    {estadoConvenio === "APROBADO"
                      ? "✓ Convenio aprobado"
                      : "✕ Convenio rechazado"}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (!archivoFinal) {
                          toast.error("Sube el convenio firmado antes de aprobar");
                          return;
                        }
                        setModalAccion("APROBADO");
                      }}
                      disabled={enviando}
                      className="flex items-center justify-center gap-2 bg-[#e8192c] hover:bg-[#c8111f] disabled:opacity-60 active:scale-95 text-white text-sm font-medium rounded-xl px-5 py-2.5 transition-all w-full"
                    >
                      <Check size={18} />
                      {enviando ? "Procesando..." : "Aprobar convenio"}
                    </button>

                    <button
                      onClick={handleHistorial}
                      disabled={enviando}
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 border border-gray-300 disabled:opacity-60 active:scale-95 text-gray-700 text-sm font-medium rounded-xl px-5 py-2.5 transition-all w-full"
                    >
                      <MessageSquare size={18} />
                      Comentar
                    </button>

                    <button
                      onClick={() => {
                        if (!comentario.trim()) {
                          toast.error("Debe ingresar un comentario");
                          return;
                        }
                        setModalAccion("RECHAZADO");
                      }}
                      disabled={enviando}
                      className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-60 active:scale-95 text-gray-700 text-sm font-medium rounded-xl px-5 py-2.5 transition-all w-full"
                    >
                      <X size={18} />
                      Rechazar convenio
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: REVISIÓN DE REQUISITO */}
      <ConfirmModal
        isOpen={modalReq !== null}
        onClose={() => setModalReq(null)}
        title={
          modalReq === "APROBADO"
            ? "¿Aprobar documento?"
            : "¿Rechazar documento?"
        }
        message={
          modalReq === "APROBADO"
            ? "Al aprobar este documento no podrás revertir la decisión."
            : "La empresa deberá subir nuevamente este documento con las correcciones."
        }
        confirmText={modalReq === "APROBADO" ? "Aprobar" : "Rechazar"}
        onConfirm={handleRevisarRequisito}
      />

      {/* MODAL: CONVENIO */}
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
            ? "Esta acción no se puede deshacer. El borrador de la empresa se reemplazará por el convenio firmado y el convenio quedará finalizado."
            : "Al rechazar el convenio se registrará la decisión y no podrá continuar el proceso."
        }
        confirmText={modalAccion === "APROBADO" ? "Aprobar" : "Rechazar"}
        onConfirm={() => {
          const accion = modalAccion;
          setModalAccion(null);

          if (accion === "APROBADO") handleAprobar();
          if (accion === "RECHAZADO") handleRechazar();
        }}
      />
    </div>
  );
}