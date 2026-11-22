
import React, { useCallback, useEffect, useState } from "react";
import {
  FileSearch,
  FileDown,
  FileUp,
  RefreshCw,
  X,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";

import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";
import VisorPdfModal from "../../components/modals/VisorPdfModal";

import { practicaRequisitoDocumentoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoRepository";
import { practicaRequisitoDocumentoSubidoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoSubidoRepository";

import { obtenerRequisitosPracticanteVigentes } from "../../../aplicacion/practicaRequisitoDocumento/obtenerRequisitosPracticanteVigentes";
import { obtenerRequisitosEmpresaVigentes } from "../../../aplicacion/practicaRequisitoDocumento/obtenerRequisitosEmpresaVigentes";

import { obtenerMisDocumentosRequisitos } from "../../../aplicacion/practicaRequisitoDocumentoSubido/obtenerMisDocumentosRequisitos";
import { subirPracticaRequisitoDocumento } from "../../../aplicacion/practicaRequisitoDocumentoSubido/subirPracticaRequisitoDocumento";
import { editarPracticaRequisitoDocumento } from "../../../aplicacion/practicaRequisitoDocumentoSubido/editarPracticaRequisitoDocumento";

const ESTADOS = {
  PENDIENTE: "PENDIENTE",
  APROBADO: "APROBADO",
  RECHAZADO: "RECHAZADO",
};

const MENSAJE_CONTACTAR_TUTOR =
  "El plazo para este documento no está habilitado. Comunícate con tu tutor docente.";

// Convierte "YYYY-MM-DD" a fecha local (evita el desfase de zona horaria de new Date("2026-02-01"))
const parsearFechaLocal = (valor) => {
  if (!valor) return null;
  const [y, m, d] = String(valor).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const formatearFecha = (valor) => {
  const fecha = parsearFechaLocal(valor);
  if (!fecha) return "—";
  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Devuelve { habilitado, motivo }
const evaluarVentana = (fechaInicio, fechaLimite) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const inicio = parsearFechaLocal(fechaInicio);
  const limite = parsearFechaLocal(fechaLimite);

  if (inicio && hoy < inicio) {
    return {
      habilitado: false,
      motivo: `Aún no está habilitada la entrega. Podrás subir este documento desde el ${formatearFecha(fechaInicio)}.`,
    };
  }

  if (limite && hoy > limite) {
    return {
      habilitado: false,
      motivo: `El plazo de entrega venció el ${formatearFecha(fechaLimite)}. Escríbele a tu tutor docente.`,
    };
  }

  return { habilitado: true, motivo: null };
};

const PAGE_SIZE = 6;
const MAX_SIZE_PDF = 2 * 1024 * 1024; // 2 MB

// =============================================================
// SKELETON
// =============================================================

const DocumentosSkeleton = ({ filas = 4 }) => (
  <div
    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    aria-busy="true"
    aria-label="Cargando documentos"
  >
    <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-3 w-20 rounded bg-slate-200 animate-pulse"
        />
      ))}
    </div>

    {Array.from({ length: filas }).map((_, fila) => (
      <div
        key={fila}
        className="grid grid-cols-3 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
      >
        <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />

        <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />

        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================

const Documentos = ({ rol = "Practicante" }) => {
  const [documentos, setDocumentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);

  const [modalVer, setModalVer] = useState(false);
  const [modalSubir, setModalSubir] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  const [accionConfirmacion, setAccionConfirmacion] = useState("enviado");

  // =========================================================
  // CARGAR REQUISITOS Y DOCUMENTOS
  // =========================================================

  const cargarDocumentos = useCallback(async () => {
    try {
      setLoading(true);

      const obtenerRequisitos =
        rol === "Empresa"
          ? obtenerRequisitosEmpresaVigentes
          : obtenerRequisitosPracticanteVigentes;

      const [respuestaRequisitos, documentosSubidos] = await Promise.all([
        obtenerRequisitos({ practicaRequisitoDocumentoRepository }),
        obtenerMisDocumentosRequisitos({
          practicaRequisitoDocumentoSubidoRepository,
        }),
      ]);

      console.log("requisitos y documentos", respuestaRequisitos);

      const requisitos = Array.isArray(respuestaRequisitos)
        ? respuestaRequisitos
        : respuestaRequisitos?.data || [];

      const subidos = Array.isArray(documentosSubidos)
        ? documentosSubidos
        : documentosSubidos?.data || [];

      const documentosOrdenados = [...subidos].sort(
        (a, b) =>
          new Date(b.fecha_subida || 0) -
          new Date(a.fecha_subida || 0)
      );

      const documentosFormateados = requisitos.map((requisito) => {
        const documentoSubido = documentosOrdenados.find(
          (documento) =>
            String(documento.practica_requisito_documento_id) ===
            String(requisito.id)
        );

        const ventana = evaluarVentana(requisito.fecha_inicio, requisito.fecha_limite);

        return {
          id: requisito.id,
          nombre: requisito.tipoRequisitoDocumento?.nombre || "Documento",
          estado: documentoSubido?.estado || ESTADOS.PENDIENTE,
          archivoUrl: documentoSubido?.archivo?.url || null,
          formatoUrl: requisito.tipoRequisitoDocumento?.plantilla?.url || null,
          observacion: documentoSubido?.observacion || null,
          fechaInicio: requisito.fecha_inicio,
          fechaLimite: requisito.fecha_limite,
          ventanaHabilitada: ventana.habilitado,
          motivoBloqueo: ventana.motivo,
          documentoSubido,
          requisito,
        };
      });

      setDocumentos(documentosFormateados);
    } catch (error) {
      console.error("Error al cargar documentos:", error);

      toast.error(
        error.response?.data?.message ||
        "No fue posible cargar los documentos."
      );

      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  }, [rol]);

  useEffect(() => {
    cargarDocumentos();
  }, [cargarDocumentos]);

  // =========================================================
  // MODALES
  // =========================================================

  const abrirVer = (doc) => {
    setDocumentoSeleccionado(doc);
    setModalVer(true);
  };

  const abrirSubir = (doc) => {
    if (!doc.ventanaHabilitada) {
      toast.error(doc.motivoBloqueo || MENSAJE_CONTACTAR_TUTOR);
      return;
    }
    setDocumentoSeleccionado(doc);
    setModalSubir(true);
  };

  const abrirEditar = (doc) => {
    if (!doc.ventanaHabilitada) {
      toast.error(doc.motivoBloqueo || MENSAJE_CONTACTAR_TUTOR);
      return;
    }
    setDocumentoSeleccionado(doc);
    setModalEditar(true);
  };

  const cerrarModales = () => {
    setModalVer(false);
    setModalSubir(false);
    setModalEditar(false);
    setModalConfirmacion(false);
    setDocumentoSeleccionado(null);
  };

  // =========================================================
  // DESCARGAR FORMATO
  // =========================================================

  const descargarFormato = (row) => {
    if (!row.formatoUrl) {
      toast.error("Este requisito no tiene un formato disponible.");
      return;
    }

    window.open(row.formatoUrl, "_blank", "noopener,noreferrer");
  };

  // =========================================================
  // SUBIR DOCUMENTO
  // =========================================================

  const handleConfirmarSubida = async (archivo) => {
    try {

      if (!documentoSeleccionado) {
        toast.error("No se ha seleccionado un requisito.");
        return false;
      }

      if (!documentoSeleccionado.ventanaHabilitada) {
        toast.error(documentoSeleccionado.motivoBloqueo || MENSAJE_CONTACTAR_TUTOR);
        return false;
      }

      if (!archivo) {
        toast.error("Debes seleccionar un archivo.");
        return false;
      }

      if (
        !archivo.name.toLowerCase().endsWith(".pdf") ||
        (archivo.type && archivo.type !== "application/pdf")
      ) {
        toast.error("Solo se permiten archivos PDF.");
        return false;
      }

      if (archivo.size > MAX_SIZE_PDF) {
        toast.error("El archivo no puede pesar más de 2 MB.");
        return false;
      }

      const formData = new FormData();

      formData.append(
        "practica_requisito_documento_id",
        documentoSeleccionado.requisito.id
      );

      formData.append("archivo", archivo);

      await subirPracticaRequisitoDocumento({
        practicaRequisitoDocumentoSubidoRepository,
        formData,
      });

      await cargarDocumentos();

      setModalSubir(false);
      setAccionConfirmacion("enviado");
      setModalConfirmacion(true);

      toast.success("Documento enviado correctamente.");

      return true;
    } catch (error) {
      console.error("Error al subir el documento:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "No fue posible subir el documento."
      );

      return false;
    }
  };

  // =========================================================
  // EDITAR / REEMPLAZAR DOCUMENTO
  // =========================================================

  const handleConfirmarEdicion = async (archivo) => {
    try {
      if (!documentoSeleccionado) {
        toast.error("No se ha seleccionado un requisito.");
        return false;
      }

      if (!documentoSeleccionado.ventanaHabilitada) {
        toast.error(documentoSeleccionado.motivoBloqueo || MENSAJE_CONTACTAR_TUTOR);
        return false;
      }

      if (!documentoSeleccionado.documentoSubido) {
        toast.error("No se encontró el documento que deseas editar.");
        return false;
      }

      if (documentoSeleccionado.estado === ESTADOS.APROBADO) {
        toast.error("No puedes editar un documento que ya fue aprobado.");
        return false;
      }

      if (!archivo) {
        toast.error("Debes seleccionar un archivo.");
        return false;
      }

      if (
        !archivo.name.toLowerCase().endsWith(".pdf") ||
        (archivo.type && archivo.type !== "application/pdf")
      ) {
        toast.error("Solo se permiten archivos PDF.");
        return false;
      }

      if (archivo.size > MAX_SIZE_PDF) {
        toast.error("El archivo no puede pesar más de 2 MB.");
        return false;
      }

      const formData = new FormData();

      formData.append(
        "practica_requisito_documento_id",
        documentoSeleccionado.requisito.id
      );

      formData.append("archivo", archivo);

      await editarPracticaRequisitoDocumento({
        practicaRequisitoDocumentoSubidoRepository,
        formData,
      });

      await cargarDocumentos();

      setModalEditar(false);
      setAccionConfirmacion("actualizado");
      setModalConfirmacion(true);

      toast.success("Documento actualizado correctamente.");

      return true;
    } catch (error) {
      console.error("Error al editar el documento:", error);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "No fue posible actualizar el documento."
      );

      return false;
    }
  };

  // =========================================================
  // COLUMNAS DE LA TABLA
  // =========================================================

  const columns = [
  { key: "nombre", label: "Nombre", primary: true },
  {
    key: "fechas",
    label: "Fecha de entrega",
    render: (row) => (
      <div className="text-xs text-slate-600 leading-5">
        <div>
          <span className="font-semibold text-slate-700">Inicio: </span>
          {formatearFecha(row.fechaInicio)}
        </div>
        <div>
          <span className="font-semibold text-slate-700">Fin: </span>
          {formatearFecha(row.fechaLimite)}
        </div>

        {!row.ventanaHabilitada && (
          <p className="mt-1 text-[11px] font-semibold text-red-600">
            Fuera de plazo · escribe a tu tutor docente
          </p>
        )}
      </div>
    ),
  },
  {
    key: "estado",
    label: "Estado",
    render: (row) => <EstadoBadge estado={row.estado} />,
  },
  {
    key: "acciones",
    label: "Acciones",
    render: (row) => {
      const tieneDocumento = Boolean(row.documentoSubido);
      const puedeSubir = row.estado !== ESTADOS.APROBADO;
      const bloqueado = !row.ventanaHabilitada;

      return (
        <div className="flex items-center gap-2 justify-center">
          {tieneDocumento && (
            <button
              type="button"
              onClick={() => abrirVer(row)}
              title="Ver documento enviado"
              aria-label="Ver documento enviado"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <FileSearch size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={() => descargarFormato(row)}
            title="Descargar formato"
            aria-label="Descargar formato"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <FileDown size={18} />
          </button>

          {puedeSubir && (
            <button
              type="button"
              onClick={() =>
                tieneDocumento ? abrirEditar(row) : abrirSubir(row)
              }
              disabled={bloqueado}
              title={
                bloqueado
                  ? row.motivoBloqueo
                  : tieneDocumento
                  ? "Reemplazar documento"
                  : "Subir documento"
              }
              aria-label={
                tieneDocumento
                  ? "Reemplazar documento"
                  : "Subir documento"
              }
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                bloqueado
                  ? "text-slate-400"
                  : tieneDocumento
                  ? "text-amber-600 hover:bg-amber-50"
                  : "text-[#e8192c] hover:bg-red-50"
              }`}
            >
              {tieneDocumento ? (
                <RefreshCw size={18} />
              ) : (
                <FileUp size={18} />
              )}
            </button>
          )}
        </div>
      );
    },
  },
];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      <h1
        className="
          text-[26px]
          font-extrabold
          text-slate-800
          text-center
          mb-7
          tracking-tight
        "
      >
        Documentos a subir
      </h1>

      {loading ? (
        <DocumentosSkeleton />
      ) : (
        <GenericTable
          rows={documentos}
          columns={columns}
          pageSize={PAGE_SIZE}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          emptyMessage="No hay documentos para mostrar"
        />
      )}

      {/* VER DOCUMENTO EXISTENTE */}
      {modalVer && documentoSeleccionado && (
        documentoSeleccionado.archivoUrl ? (
          <VisorPdfModal
            url={documentoSeleccionado.archivoUrl}
            titulo={documentoSeleccionado.nombre}
            subtitulo="Documento enviado"
            onClose={cerrarModales}
            pie={
              <div className="shrink-0 border-t border-slate-200 px-5 py-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Estado del documento
                  </span>

                  <EstadoBadge estado={documentoSeleccionado.estado} />
                </div>

                {documentoSeleccionado.estado === ESTADOS.RECHAZADO && (
                  <MotivoRechazo
                    motivo={documentoSeleccionado.observacion}
                  />
                )}

                <div className="flex justify-end">
                  <BotonSecundario onClick={cerrarModales}>
                    Cerrar
                  </BotonSecundario>
                </div>
              </div>
            }
          />
        ) : (
          <ModalBase
            titulo={documentoSeleccionado.nombre}
            subtitulo="Documento enviado"
            onClose={cerrarModales}
            footer={
              <BotonSecundario onClick={cerrarModales}>
                Cerrar
              </BotonSecundario>
            }
          >
            <p className="text-sm text-slate-500">
              No hay una vista previa disponible para este documento.
            </p>
          </ModalBase>
        )
      )}

      {/* SUBIR DOCUMENTO */}
      {modalSubir && (
        <ModalFormularioDocumento
          titulo="Subir documento"
          documento={documentoSeleccionado}
          textoConfirmar="Confirmar envío"
          onClose={cerrarModales}
          onConfirmar={handleConfirmarSubida}
        />
      )}

      {/* EDITAR DOCUMENTO */}
      {modalEditar && (
        <ModalFormularioDocumento
          titulo="Reemplazar documento"
          documento={documentoSeleccionado}
          textoConfirmar="Confirmar actualización"
          onClose={cerrarModales}
          onConfirmar={handleConfirmarEdicion}
        />
      )}

      {/* CONFIRMACIÓN FINAL */}
      {modalConfirmacion && (
        <ModalConfirmacion
          documento={documentoSeleccionado}
          accion={accionConfirmacion}
          onClose={cerrarModales}
        />
      )}
    </div>
  );
};

// =============================================================
// MODAL BASE
// =============================================================

const ModalBase = ({
  titulo,
  subtitulo,
  onClose,
  children,
  footer,
  ancho = "max-w-lg",
  zIndex = "z-50",
}) => (
  <div
    className={`fixed inset-0 bg-black/40 flex items-center justify-center p-4 ${zIndex}`}
  >
    <div
      className={`bg-white rounded-xl shadow-xl w-full ${ancho} max-h-[90vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            {titulo}
          </h2>

          {subtitulo && (
            <p className="text-sm text-slate-500 mt-0.5">
              {subtitulo}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="px-6 py-5 overflow-y-auto">
        {children}
      </div>

      {footer && (
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100">
          {footer}
        </div>
      )}
    </div>
  </div>
);

const BotonSecundario = ({ children, ...props }) => (
  <button
    type="button"
    className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

const BotonPrimario = ({ children, ...props }) => (
  <button
    type="button"
    className="px-4 py-2 rounded-lg bg-[#e8192c] text-white text-sm font-bold hover:bg-[#c91525] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    {...props}
  >
    {children}
  </button>
);

// =============================================================
// MOTIVO DE RECHAZO
// =============================================================

const MotivoRechazo = ({ motivo }) => (
  <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3">
    <p className="text-xs font-bold text-red-600 mb-1">
      Motivo del rechazo
    </p>

    <p className="text-sm text-red-600">
      {motivo || "No se indicó un motivo."}
    </p>
  </div>
);

// =============================================================
// MODAL FORMULARIO (SELECCIONAR PDF)
// =============================================================

const ModalFormularioDocumento = ({
  titulo,
  documento,
  textoConfirmar,
  onClose,
  onConfirmar,
}) => {
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [urlPrevia, setUrlPrevia] = useState(null);

  // =========================================================
  // GENERAR URL TEMPORAL DEL ARCHIVO
  // =========================================================

  useEffect(() => {
    if (!archivo) {
      setUrlPrevia(null);
      return;
    }

    const url = URL.createObjectURL(archivo);

    setUrlPrevia(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [archivo]);

  // =========================================================
  // SELECCIONAR ARCHIVO
  // =========================================================

  const handleSeleccionarArchivo = (e) => {
    const seleccionado = e.target.files?.[0];

    if (!seleccionado) return;

    const esPDF =
      seleccionado.name.toLowerCase().endsWith(".pdf") &&
      (!seleccionado.type || seleccionado.type === "application/pdf");

    if (!esPDF) {
      toast.error("Solo se permiten archivos PDF.");
      setArchivo(null);
      setMostrarVistaPrevia(false);
      e.target.value = "";
      return;
    }

    if (seleccionado.size > MAX_SIZE_PDF) {
      toast.error("El archivo no puede pesar más de 2 MB.");
      setArchivo(null);
      setMostrarVistaPrevia(false);
      e.target.value = "";
      return;
    }

    setArchivo(seleccionado);
    setMostrarVistaPrevia(false);
  };

  // =========================================================
  // CONFIRMAR ENVÍO / ACTUALIZACIÓN
  // =========================================================

  const handleConfirmar = async () => {
    if (!archivo || enviando) return;

    const esPDF =
      archivo.name.toLowerCase().endsWith(".pdf") &&
      (!archivo.type || archivo.type === "application/pdf");

    if (!esPDF) {
      toast.error("Solo se permiten archivos PDF.");
      return;
    }

    if (archivo.size > MAX_SIZE_PDF) {
      toast.error("El archivo no puede pesar más de 2 MB.");
      return;
    }

    setEnviando(true);

    try {
      await onConfirmar(archivo);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      {/* MODAL DE SELECCIÓN */}
      <ModalBase
        titulo={titulo}
        subtitulo={documento?.nombre}
        onClose={onClose}
        footer={
          <>
            <BotonSecundario onClick={onClose}>
              Cancelar
            </BotonSecundario>

            <BotonPrimario
              onClick={() => setMostrarVistaPrevia(true)}
              disabled={!archivo || enviando}
            >
              Revisar documento
            </BotonPrimario>
          </>
        }
      >
        <div className="space-y-4">
          {documento?.estado === ESTADOS.RECHAZADO && (
            <MotivoRechazo motivo={documento.observacion} />
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Archivo (PDF)
            </label>

            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#e8192c]/50 transition-colors">
              {archivo ? (
                <FileText
                  size={28}
                  className="text-green-600"
                />
              ) : (
                <FileUp
                  size={28}
                  className="text-[#e8192c]"
                />
              )}

              <span className="text-sm font-medium text-slate-600 break-all">
                {archivo
                  ? archivo.name
                  : "Haz clic para seleccionar un archivo PDF"}
              </span>

              <span className="text-xs text-slate-400">
                {archivo
                  ? `PDF seleccionado · ${(archivo.size / 1024 / 1024).toFixed(2)} MB`
                  : "Solo archivos PDF · Tamaño máximo: 2 MB"}
              </span>

              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleSeleccionarArchivo}
              />
            </label>
          </div>
        </div>
      </ModalBase>

      {/* =====================================================
          VISOR PDF CON CONFIRMACIÓN
      ===================================================== */}

      {mostrarVistaPrevia && urlPrevia && (
        <VisorPdfModal
          url={urlPrevia}
          titulo="Revisar documento"
          subtitulo={documento?.nombre}
          bloqueado={enviando}
          onClose={() => setMostrarVistaPrevia(false)}
          pie={
            <div className="shrink-0 border-t border-slate-200 px-5 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {archivo?.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {archivo
                      ? `${(archivo.size / 1024 / 1024).toFixed(2)} MB`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <BotonSecundario
                    onClick={() => setMostrarVistaPrevia(false)}
                    disabled={enviando}
                  >
                    Volver
                  </BotonSecundario>

                  <BotonPrimario
                    onClick={handleConfirmar}
                    disabled={enviando || !archivo}
                  >
                    {enviando ? "Enviando..." : textoConfirmar}
                  </BotonPrimario>
                </div>
              </div>
            </div>
          }
        />
      )}
    </>
  );
};

// =============================================================
// MODAL CONFIRMACIÓN FINAL
// =============================================================

const ModalConfirmacion = ({ documento, accion, onClose }) => {
  const esEdicion = accion === "actualizado";

  return (
    <ModalBase
      titulo={esEdicion ? "Documento actualizado" : "Documento enviado"}
      onClose={onClose}
      footer={
        <BotonPrimario onClick={onClose}>
          Entendido
        </BotonPrimario>
      }
    >
      <p className="text-sm text-slate-600">
        El documento{" "}
        <span className="font-semibold">
          {documento?.nombre}
        </span>{" "}
        {esEdicion
          ? "se actualizó correctamente y quedó pendiente de revisión."
          : "se envió correctamente y quedó pendiente de revisión."}
      </p>
    </ModalBase>
  );
};

export default Documentos;
