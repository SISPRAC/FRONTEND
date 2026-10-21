
import React, { useCallback, useEffect, useState } from "react";
import { Eye, Upload, Pencil, Download, X, FileText } from "lucide-react";
import toast from "react-hot-toast";

import GenericTable from "../../components/Table/GenericTable";

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

const PAGE_SIZE = 6;

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
  // CARGAR REQUISITOS Y ESTADOS REALES
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

      const requisitos = Array.isArray(respuestaRequisitos)
        ? respuestaRequisitos
        : respuestaRequisitos?.data || [];

      const subidos = Array.isArray(documentosSubidos)
        ? documentosSubidos
        : documentosSubidos?.data || [];

      // Del más reciente al más antiguo.
      const documentosOrdenados = [...subidos].sort(
        (a, b) =>
          new Date(b.fecha_subida || 0) - new Date(a.fecha_subida || 0)
      );

      const documentosFormateados = requisitos.map((requisito) => {
        // Última entrega de este requisito.
        const documentoSubido = documentosOrdenados.find(
          (documento) =>
            String(documento.practica_requisito_documento_id) ===
            String(requisito.id)
        );

        return {
          id: requisito.id,
          nombre: requisito.tipoRequisitoDocumento?.nombre || "Documento",
          estado: documentoSubido?.estado || ESTADOS.PENDIENTE,
          archivoUrl: documentoSubido?.archivo?.url || null,
          formatoUrl:
            requisito.tipoRequisitoDocumento?.plantilla?.url || null,
          observacion: documentoSubido?.observacion || null,
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
    setDocumentoSeleccionado(doc);
    setModalSubir(true);
  };

  const abrirEditar = (doc) => {
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
  // SUBIR DOCUMENTO POR PRIMERA VEZ
  // =========================================================

  const handleConfirmarSubida = async (archivo) => {
    try {
      if (!documentoSeleccionado) {
        toast.error("No se ha seleccionado un requisito.");
        return false;
      }

      if (!archivo) {
        toast.error("Debes seleccionar un archivo.");
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
  // EDITAR / REEMPLAZAR DOCUMENTO EXISTENTE
  // =========================================================

  const handleConfirmarEdicion = async (archivo) => {
    try {
      if (!documentoSeleccionado) {
        toast.error("No se ha seleccionado un requisito.");
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
    {
      key: "nombre",
      label: "Nombre",
      primary: true,
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

        return (
          <div className="flex items-center gap-2 justify-center">
            {tieneDocumento && (
              <button
                type="button"
                onClick={() => abrirVer(row)}
                title="Ver documento enviado"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#e8192c] hover:bg-slate-100 transition-colors"
              >
                <Eye size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={() => descargarFormato(row)}
              title="Descargar formato"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Download size={16} />
            </button>

            {puedeSubir && (
              <button
                type="button"
                onClick={() =>
                  tieneDocumento ? abrirEditar(row) : abrirSubir(row)
                }
                title={tieneDocumento ? "Editar documento" : "Subir documento"}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  tieneDocumento
                    ? "text-blue-600 hover:bg-blue-50"
                    : "text-[#e8192c] hover:bg-red-50"
                }`}
              >
                {tieneDocumento ? <Pencil size={16} /> : <Upload size={16} />}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Documentos a subir
        </h1>

        <GenericTable
          rows={documentos}
          columns={columns}
          pageSize={PAGE_SIZE}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          loading={loading}
          emptyMessage="No hay documentos para mostrar"
        />
      </div>

      {modalVer && (
        <ModalVerDocumento
          documento={documentoSeleccionado}
          onClose={cerrarModales}
        />
      )}

      {modalSubir && (
        <ModalFormularioDocumento
          titulo="Subir documento"
          documento={documentoSeleccionado}
          textoConfirmar="Enviar documento"
          onClose={cerrarModales}
          onConfirmar={handleConfirmarSubida}
        />
      )}

      {modalEditar && (
        <ModalFormularioDocumento
          titulo="Editar documento"
          documento={documentoSeleccionado}
          textoConfirmar="Guardar cambios"
          onClose={cerrarModales}
          onConfirmar={handleConfirmarEdicion}
        />
      )}

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
// ESTADO
// =============================================================

const EstadoBadge = ({ estado }) => {
  const configuracion = {
    PENDIENTE: {
      texto: "Pendiente",
      clase: "text-amber-600",
      punto: "bg-amber-500",
    },
    APROBADO: {
      texto: "Aprobado",
      clase: "text-emerald-600",
      punto: "bg-emerald-500",
    },
    RECHAZADO: {
      texto: "Rechazado",
      clase: "text-red-600",
      punto: "bg-red-600",
    },
  };

  const estadoActual = configuracion[estado] || configuracion.PENDIENTE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold ${estadoActual.clase}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${estadoActual.punto}`} />
      {estadoActual.texto}
    </span>
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
}) => (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
    onClick={onClose}
  >
    <div
      className={`bg-white rounded-xl shadow-xl w-full ${ancho} max-h-[90vh] flex flex-col`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800">{titulo}</h2>
          {subtitulo && (
            <p className="text-sm text-slate-500 mt-0.5">{subtitulo}</p>
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

      <div className="px-6 py-5 overflow-y-auto">{children}</div>

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
    <p className="text-xs font-bold text-red-600 mb-1">Motivo del rechazo</p>
    <p className="text-sm text-red-600">
      {motivo || "No se indicó un motivo."}
    </p>
  </div>
);

// =============================================================
// MODAL VER DOCUMENTO
// =============================================================

const ModalVerDocumento = ({ documento, onClose }) => (
  <ModalBase
    titulo={documento?.nombre}
    subtitulo="Documento enviado"
    onClose={onClose}
    ancho="max-w-2xl"
    footer={<BotonSecundario onClick={onClose}>Cerrar</BotonSecundario>}
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">Estado</span>
        <EstadoBadge estado={documento?.estado} />
      </div>

      {documento?.archivoUrl ? (
        <iframe
          src={documento.archivoUrl}
          title={documento.nombre}
          className="w-full h-[55vh] border border-slate-200 rounded-lg"
        />
      ) : (
        <p className="text-sm text-slate-500">
          No hay una vista previa disponible para este documento.
        </p>
      )}

      {documento?.estado === ESTADOS.RECHAZADO && (
        <MotivoRechazo motivo={documento.observacion} />
      )}
    </div>
  </ModalBase>
);

// =============================================================
// MODAL FORMULARIO (SUBIR / EDITAR)
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

  const handleConfirmar = async () => {
    if (!archivo || enviando) return;

    setEnviando(true);

    try {
      await onConfirmar(archivo);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <ModalBase
      titulo={titulo}
      subtitulo={documento?.nombre}
      onClose={onClose}
      footer={
        <>
          <BotonSecundario onClick={onClose} disabled={enviando}>
            Cancelar
          </BotonSecundario>

          <BotonPrimario
            onClick={handleConfirmar}
            disabled={!archivo || enviando}
          >
            {enviando ? "Enviando..." : textoConfirmar}
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
              <FileText size={24} className="text-[#e8192c]" />
            ) : (
              <Upload size={24} className="text-[#e8192c]" />
            )}

            <span className="text-sm text-slate-500">
              {archivo
                ? archivo.name
                : "Haz clic para seleccionar un archivo PDF"}
            </span>

            <input
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </div>
    </ModalBase>
  );
};

// =============================================================
// MODAL CONFIRMACIÓN
// =============================================================

const ModalConfirmacion = ({ documento, accion, onClose }) => {
  const esEdicion = accion === "actualizado";

  return (
    <ModalBase
      titulo={esEdicion ? "Documento actualizado" : "Documento enviado"}
      onClose={onClose}
      footer={<BotonPrimario onClick={onClose}>Entendido</BotonPrimario>}
    >
      <p className="text-sm text-slate-600">
        El documento{" "}
        <span className="font-semibold">{documento?.nombre}</span>{" "}
        {esEdicion
          ? "se actualizó correctamente y quedó pendiente de revisión."
          : "se envió correctamente y quedó pendiente de revisión."}
      </p>
    </ModalBase>
  );
};

export default Documentos;
