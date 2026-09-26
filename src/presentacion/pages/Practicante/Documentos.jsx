import React, { useEffect, useState } from "react";
import { Eye, Upload, Pencil } from "lucide-react";
import Layout from "../../shared/Layouts/Layout";
// TODO: ajustar la ruta según dónde vivas GenericTable en tu proyecto.
import GenericTable from "../../components/Table/GenericTable";
import {practicaRequisitoDocumentoRepository} from "../../../infraestructura/repository/practicaRequisitoDocumentoRepository";

import { obtenerRequisitosPracticanteVigentes } from "../../../aplicacion/practicaRequisitoDocumento/obtenerRequisitosPracticanteVigentes";

/**
 * TODO: Reemplazar por el caso de uso real que trae los documentos.
 * El backend ya resuelve qué documentos corresponden según el rol
 * (practicante / empresa), así que este componente solo pinta lo
 * que le llegue, sin filtrar nada por rol acá.
 *
 * const { documentos, isLoading, error } = useObtenerDocumentos();
 */

const ESTADOS = {
  PENDIENTE: "pendiente",
  ENVIADO: "enviado",
};


const PAGE_SIZE = 6;

const Documentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [modalVer, setModalVer] = useState(false);
  const [modalSubir, setModalSubir] = useState(false);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);

  const abrirVer = (doc) => {
    setDocumentoSeleccionado(doc);
    setModalVer(true);
  };

  const abrirSubir = (doc) => {
    setDocumentoSeleccionado(doc);
    setModalSubir(true);
  };

  const cerrarModales = () => {
    setModalVer(false);
    setModalSubir(false);
    setModalConfirmacion(false);
    setDocumentoSeleccionado(null);
  };

  /**
   * TODO: acá va la llamada real al caso de uso de subida.
   * Dejo la firma pensada para recibir el archivo y el id del documento:
   *
   * await subirDocumentoCasoDeUso.ejecutar(documentoSeleccionado.id, archivo);
   */
  const handleConfirmarSubida = async (archivo) => {
    // Optimista por ahora: cuando esté el caso de uso, esto se actualiza
    // con la respuesta real del backend (o se revierte si falla).
    setDocumentos((prev) =>
      prev.map((d) =>
        d.id === documentoSeleccionado.id ? { ...d, estado: ESTADOS.ENVIADO } : d
      )
    );
    setModalSubir(false);
    setModalConfirmacion(true);
  };

  useEffect(() => {
    const cargarDocumentos = async () => {
      try {
        setLoading(true);

        const respuesta =
          await obtenerRequisitosPracticanteVigentes({practicaRequisitoDocumentoRepository});

        console.log("RESPUESTA DOCUMENTOS:", respuesta);

        const requisitos = Array.isArray(respuesta)
          ? respuesta
          : respuesta?.data || [];

        console.log("REQUISITOS:", requisitos);

        const documentosFormateados = requisitos.map((requisito) => ({
          id: requisito.id,
          nombre:
            requisito.tipoRequisitoDocumento?.nombre ||
            "Documento",
          estado: ESTADOS.PENDIENTE,
          archivoUrl: null,
          requisito,
        }));

        setDocumentos(documentosFormateados);

      } catch (error) {
        console.error(
          "Error al cargar documentos:",
          error
        );

        setDocumentos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarDocumentos();
  }, []);

  // GenericTable pinta un botón por cada item de "actions" con el mismo
  // ícono para todas las filas, pero acá el botón depende del estado
  // de cada documento, así que se resuelve con una columna propia en
  // vez de usar la prop `actions`.
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
      render: (row) =>
        row.estado === ESTADOS.PENDIENTE ? (
          <button
            onClick={() => abrirSubir(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e8192c] text-white text-xs font-bold hover:bg-[#c91525] transition-colors"
          >
            <Upload size={14} />
            Subir
          </button>
        ) : (
          <div className="flex items-center gap-2 justify-center">
            <button
              onClick={() => abrirVer(row)}
              title="Ver documento"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#e8192c] hover:bg-slate-100 transition-colors"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => abrirSubir(row)}
              title="Editar documento"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>
        ),
    },
  ];

  return (
    <Layout footerLabel="Documentos">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Documentos a subir</h1>

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
        <ModalVerDocumento documento={documentoSeleccionado} onClose={cerrarModales} />
      )}

      {modalSubir && (
        <ModalSubirDocumento
          documento={documentoSeleccionado}
          onClose={cerrarModales}
          onConfirmar={handleConfirmarSubida}
        />
      )}

      {modalConfirmacion && (
        <ModalConfirmacion documento={documentoSeleccionado} onClose={cerrarModales} />
      )}
    </Layout>
  );
};

const EstadoBadge = ({ estado }) => {
  const esEnviado = estado === ESTADOS.ENVIADO;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold ${esEnviado ? "text-emerald-600" : "text-slate-400"
        }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${esEnviado ? "bg-emerald-500" : "bg-slate-400"}`} />
      {esEnviado ? "Enviado" : "Pendiente"}
    </span>
  );
};

// Modal simple, sin librerías externas, para no salir de la página.
const ModalBase = ({ titulo, onClose, children }) => (
  <div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800">{titulo}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>
      <div className="p-5 overflow-y-auto">{children}</div>
    </div>
  </div>
);

const ModalVerDocumento = ({ documento, onClose }) => (
  <ModalBase titulo={documento?.nombre} onClose={onClose}>
    {documento?.archivoUrl ? (
      // TODO: acá va la URL real del PDF que devuelva el backend.
      <iframe
        src={documento.archivoUrl}
        title={documento.nombre}
        className="w-full h-[65vh] border border-slate-200 rounded-lg"
      />
    ) : (
      <p className="text-sm text-slate-500">
        Aún no hay una vista previa disponible para este documento.
      </p>
    )}
  </ModalBase>
);

const ModalSubirDocumento = ({ documento, onClose, onConfirmar }) => {
  const [archivo, setArchivo] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleConfirmar = async () => {
    setEnviando(true);
    await onConfirmar(archivo);
    setEnviando(false);
  };

  return (
    <ModalBase titulo={`Subir: ${documento?.nombre}`} onClose={onClose}>
      <div className="space-y-4">
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#e8192c]/50 transition-colors">
          <span className="text-sm text-slate-500">
            {archivo ? archivo.name : "Arrastra el archivo aquí o haz clic para seleccionarlo"}
          </span>
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
        </label>

        {/* TODO: reemplazar por la llamada real al caso de uso de subida */}
        <button
          disabled={!archivo || enviando}
          onClick={handleConfirmar}
          className="w-full py-2 rounded-lg bg-[#e8192c] text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#c91525] transition-colors"
        >
          {enviando ? "Enviando..." : "Confirmar envío"}
        </button>
      </div>
    </ModalBase>
  );
};

const ModalConfirmacion = ({ documento, onClose }) => (
  <ModalBase titulo="Documento enviado" onClose={onClose}>
    <p className="text-sm text-slate-600 mb-4">
      El documento {documento?.nombre} se envió correctamente y quedará pendiente de revisión.
    </p>
    <button
      onClick={onClose}
      className="px-4 py-2 rounded-lg bg-[#e8192c] text-white text-sm font-bold hover:bg-[#c91525] transition-colors"
    >
      Entendido
    </button>
  </ModalBase>
);

export default Documentos;