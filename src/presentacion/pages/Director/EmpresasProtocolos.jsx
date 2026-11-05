import React, { useEffect, useState } from "react";
import {
    Building2,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    FileText,
    AlertCircle,
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { obtenerEmpresasDocumentosPorPractica } from "../../../aplicacion/practicaRequisitoDocumentoSubido/obtenerEmpresasDocumentosPorPractica.js";

import { practicaRequisitoDocumentoSubidoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoSubidoRepository.js";

import { aprobarDocumentoRequisito } from "../../../aplicacion/practicaRequisitoDocumentoSubido/aprobarDocumentoRequisito.js";
import { rechazarDocumentoRequisito } from "../../../aplicacion/practicaRequisitoDocumentoSubido/rechazarDocumentoRequisito.js";

import { getDocumentosEmpresaPorPractica } from "../../../aplicacion/practicaRequisitoDocumentoSubido/getDocumentosEmpresaPorPractica.js";
// -----------------------------------------------------------------------
// Badge de estado del documento
// -----------------------------------------------------------------------

function DocEstadoBadge({ estado }) {
    const styles = {
        APROBADO: "bg-green-100 text-green-700",
        PENDIENTE: "bg-gray-200 text-gray-600",
        RECHAZADO: "bg-red-100 text-red-600",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[estado] || "bg-gray-100 text-gray-600"
                }`}
        >
            {estado || "Sin estado"}
        </span>
    );
}

// -----------------------------------------------------------------------
// Ventana de confirmación (aprobar / rechazar)
// -----------------------------------------------------------------------

function ConfirmarAccionDialog({
    tipo, // "aprobar" | "rechazar"
    nombreDocumento,
    observacion,
    onObservacionChange,
    procesando,
    placeholderMotivo,
    onCancelar,
    onConfirmar,
}) {
    const esRechazo = tipo === "rechazar";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
            onClick={(e) => {
                e.stopPropagation();
                if (!procesando) onCancelar();
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <h3 className="text-lg font-bold text-gray-900">
                    {esRechazo
                        ? "¿Rechazar este documento?"
                        : "¿Aprobar este documento?"}
                </h3>

                <p className="mt-1 truncate text-sm text-gray-500">
                    {nombreDocumento}
                </p>

                {esRechazo ? (
                    <div className="mt-4 space-y-2">
                        <label
                            htmlFor="observacion-rechazo"
                            className="block text-sm font-semibold text-gray-700"
                        >
                            Motivo del rechazo
                        </label>

                        <textarea
                            id="observacion-rechazo"
                            autoFocus
                            value={observacion}
                            onChange={(e) =>
                                onObservacionChange(e.target.value)
                            }
                            placeholder={placeholderMotivo}
                            rows={4}
                            maxLength={2000}
                            disabled={procesando}
                            className="w-full resize-none rounded-lg border border-gray-200 p-3 text-sm outline-none focus:border-red-400 disabled:bg-gray-100"
                        />
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-gray-600">
                        Esta acción marcará el documento como aprobado.
                    </p>
                )}

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={procesando}
                        className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirmar}
                        disabled={
                            procesando || (esRechazo && !observacion.trim())
                        }
                        className={`rounded-lg px-5 py-2.5 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${esRechazo
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {procesando
                            ? "Procesando..."
                            : esRechazo
                                ? "Confirmar rechazo"
                                : "Confirmar aprobación"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Modal de documentos de la empresa
// -----------------------------------------------------------------------

function EmpresaDocumentosModal({
    open,
    onClose,
    empresa,
    documentos = [],
    loadingDocumentos = false,
    onAprobar,
    onRechazar,
    procesandoDocumentoId,
    mensajeAccion,
}) {
    const [index, setIndex] = useState(0);
    const [observacion, setObservacion] = useState("");
    const [accion, setAccion] = useState(null); // null | "aprobar" | "rechazar"

    useEffect(() => {
        if (open) {
            setIndex(0);
            setObservacion("");
            setAccion(null);
        }
    }, [open, empresa?.id]);

    useEffect(() => {
        setObservacion("");
        setAccion(null);
    }, [index]);

    if (!open) return null;

    const total = documentos.length;
    const doc = documentos[index];
    const procesando = Boolean(doc && procesandoDocumentoId === doc.id);
    const esRechazado = doc?.estado === "RECHAZADO";

    const goPrev = () => setIndex((actual) => (actual - 1 + total) % total);
    const goNext = () => setIndex((actual) => (actual + 1) % total);

    const confirmarAccion = async () => {
        if (accion === "aprobar") {
            await onAprobar(doc.id);
        } else if (accion === "rechazar") {
            await onRechazar(doc.id, observacion);
        }
        setAccion(null);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Documentos de la empresa
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Información de la empresa */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-6 py-3 text-sm text-gray-800 md:grid-cols-4">
                    <p className="truncate">
                        <span className="font-bold">Empresa:</span>{" "}
                        {empresa?.nombre}
                    </p>
                    <p className="truncate">
                        <span className="font-bold">NIT:</span>{" "}
                        {empresa?.nit || "No disponible"}
                    </p>
                    <p className="truncate">
                        <span className="font-bold">Estado:</span>{" "}
                        {empresa?.estado || "Sin estado"}
                    </p>
                    <p className="truncate">
                        <span className="font-bold">Documentos:</span>{" "}
                        {empresa?.documentosSubidos ?? 0} /{" "}
                        {empresa?.documentosRequeridos ?? 0}
                    </p>
                </div>

                {loadingDocumentos ? (
                    <div className="flex flex-1 items-center justify-center border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Cargando documentos...
                        </p>
                    </div>
                ) : total === 0 ? (
                    <div className="flex flex-1 items-center justify-center border-t border-gray-100 px-6">
                        <p className="text-sm text-gray-500">
                            Esta empresa no tiene documentos cargados para
                            esta práctica.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Nombre y estado del documento */}
                        <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-6 py-3">
                            <p className="truncate text-sm font-semibold text-gray-800">
                                {doc?.nombre}
                            </p>
                            <DocEstadoBadge estado={doc?.estado} />
                        </div>

                        {/* Motivo del rechazo (arriba del visor) */}
                        {esRechazado && doc?.observacion && (
                            <div className="mx-6 mb-3 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0 text-red-500"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-red-700">
                                        Motivo del rechazo
                                    </p>
                                    <p className="mt-0.5 break-words text-sm text-red-600">
                                        {doc.observacion}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Visor */}
                        <div className="relative mx-6 flex min-h-[320px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                            {total > 1 && (
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    className="absolute left-2 z-10 rounded-lg bg-white p-2 text-gray-500 shadow transition hover:text-red-500"
                                    aria-label="Documento anterior"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            <div className="flex h-full w-full items-center justify-center">
                                {doc?.fileUrl ? (
                                    <iframe
                                        title={doc.nombre}
                                        src={doc.fileUrl}
                                        className="h-full w-full"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 px-4 text-center text-gray-400">
                                        <FileText size={48} />
                                        <p className="text-sm">
                                            No hay una URL disponible para
                                            visualizar el archivo.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {total > 1 && (
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="absolute right-2 z-10 rounded-lg bg-white p-2 text-gray-500 shadow transition hover:text-red-500"
                                    aria-label="Documento siguiente"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>

                        <p className="py-2 text-center text-xs font-medium text-gray-400">
                            Documento {index + 1} de {total}
                        </p>

                        {/* Pie del modal */}
                        <div className="space-y-3 border-t border-gray-100 bg-white px-6 py-4">
                            {mensajeAccion && (
                                <p className="text-center text-sm font-medium text-red-600">
                                    {mensajeAccion}
                                </p>
                            )}

                            {doc?.estado === "PENDIENTE" ? (
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setAccion("rechazar")}
                                        disabled={procesando}
                                        className="rounded-lg bg-red-600 px-8 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Rechazar
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAccion("aprobar")}
                                        disabled={procesando}
                                        className="rounded-lg bg-green-600 px-8 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Aprobar
                                    </button>
                                </div>
                            ) : (
                                <p className="text-center text-sm text-gray-500">
                                    Este documento ya fue revisado.
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Ventana de confirmación */}
            {accion && doc && (
                <ConfirmarAccionDialog
                    tipo={accion}
                    nombreDocumento={doc.nombre}
                    observacion={observacion}
                    onObservacionChange={setObservacion}
                    procesando={procesando}
                    placeholderMotivo="Explica qué debe corregir la empresa..."
                    onCancelar={() => {
                        setAccion(null);
                        setObservacion("");
                    }}
                    onConfirmar={confirmarAccion}
                />
            )}
        </div>
    );
}

// -----------------------------------------------------------------------
// Estilos de selectores
// -----------------------------------------------------------------------

const selectClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-gray-100";

// -----------------------------------------------------------------------
// Vista de empresas
// -----------------------------------------------------------------------

export default function EmpresasProtocolos() {
    const [practicas, setPracticas] = useState([]);
    const [practicaId, setPracticaId] = useState("");
    const [empresas, setEmpresas] = useState([]);

    const [buscarEmpresa, setBuscarEmpresa] = useState("");

    const [loadingPracticas, setLoadingPracticas] = useState(true);
    const [loadingEmpresas, setLoadingEmpresas] = useState(false);

    const [error, setError] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    // Modal y documentos
    const [modalOpen, setModalOpen] = useState(false);
    const [empresaActiva, setEmpresaActiva] = useState(null);
    const [documentos, setDocumentos] = useState([]);
    const [loadingDocumentos, setLoadingDocumentos] = useState(false);
    const [procesandoDocumentoId, setProcesandoDocumentoId] = useState(null);
    const [mensajeAccion, setMensajeAccion] = useState("");

    // ---------------------------------------------------------------
    // Cargar prácticas
    // ---------------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        const cargarPracticas = async () => {
            try {
                setLoadingPracticas(true);
                setError("");

                const data = await getPracticas({
                    practicaRepository,
                });

                if (!cancelled) {
                    setPracticas(data || []);
                }
            } catch (error) {
                console.error("Error al cargar las prácticas:", error);

                if (!cancelled) {
                    setError("No se pudieron cargar las prácticas.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingPracticas(false);
                }
            }
        };

        cargarPracticas();

        return () => {
            cancelled = true;
        };
    }, []);

    // ---------------------------------------------------------------
    // Cargar empresas según la práctica seleccionada
    // ---------------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        setEmpresas([]);
        setCurrentPage(1);
        setError("");

        if (!practicaId) {
            setLoadingEmpresas(false);
            return;
        }

        const cargarEmpresas = async () => {
            try {
                setLoadingEmpresas(true);

                const respuesta =
                    await obtenerEmpresasDocumentosPorPractica({
                        practicaRequisitoDocumentoSubidoRepository,
                        practica_id: practicaId,
                    });

                if (!cancelled) {
                    setEmpresas(respuesta?.data ?? []);
                }
            } catch (error) {
                console.error(
                    "Error al cargar las empresas y sus documentos:",
                    error
                );

                if (!cancelled) {
                    setError(
                        error.response?.data?.message ??
                        "No se pudieron cargar las empresas."
                    );
                    setEmpresas([]);
                }
            } finally {
                if (!cancelled) {
                    setLoadingEmpresas(false);
                }
            }
        };

        cargarEmpresas();

        return () => {
            cancelled = true;
        };
    }, [practicaId]);

    // ---------------------------------------------------------------
    // Filtrar empresas por nombre
    // ---------------------------------------------------------------

    const empresasFiltradas = empresas.filter((empresa) =>
        empresa.nombre
            ?.toLowerCase()
            .includes(buscarEmpresa.trim().toLowerCase())
    );

    // ---------------------------------------------------------------
    // Abrir documentos de la empresa
    // ---------------------------------------------------------------

    const verProtocolos = async (id) => {
        const empresa = empresasFiltradas.find(
            (item) => String(item.id) === String(id)
        );

        if (!empresa) return;

        if (!empresa.usuario_id) {
            setError("No se encontró el usuario de la empresa.");
            return;
        }

        if (!practicaId) {
            setError("Selecciona una práctica para continuar.");
            return;
        }

        setEmpresaActiva(empresa);
        setDocumentos([]);
        setModalOpen(true);
        setLoadingDocumentos(true);
        setMensajeAccion("");
        setError("");

        try {
            const respuesta = await getDocumentosEmpresaPorPractica({
                practicaRequisitoDocumentoSubidoRepository,
                usuario_id: empresa.usuario_id,
                practica_id: practicaId,
            });

            const documentosObtenidos = respuesta?.data ?? respuesta ?? [];

            setDocumentos(
                documentosObtenidos.map((documento) => ({
                    ...documento,
                    nombre:
                        documento.practicaRequisitoDocumento
                            ?.tipoRequisitoDocumento?.nombre ??
                        `Documento ${documento.id}`,
                    fileUrl: documento.archivo?.url ?? null,
                }))
            );
        } catch (error) {
            console.error(
                "Error al cargar los documentos de la empresa:",
                error
            );

            setMensajeAccion(
                error.response?.data?.message ??
                error.message ??
                "No se pudieron cargar los documentos de la empresa."
            );
        } finally {
            setLoadingDocumentos(false);
        }
    };

    // ---------------------------------------------------------------
    // Aprobar documento
    // ---------------------------------------------------------------

    const aprobarDocumento = async (id) => {
        if (procesandoDocumentoId !== null) return;

        setProcesandoDocumentoId(id);
        setMensajeAccion("");

        try {
            const respuesta = await aprobarDocumentoRequisito({
                practicaRequisitoDocumentoSubidoRepository,
                id,
            });

            const documentoActualizado = respuesta?.data ?? respuesta;

            setDocumentos((actuales) =>
                actuales.map((documento) =>
                    documento.id === id
                        ? { ...documento, ...documentoActualizado }
                        : documento
                )
            );

            const respuestaEmpresas =
                await obtenerEmpresasDocumentosPorPractica({
                    practicaRequisitoDocumentoSubidoRepository,
                    practica_id: practicaId,
                });

            setEmpresas(respuestaEmpresas?.data ?? []);
        } catch (error) {
            console.error("Error al aprobar el documento:", error);

            setMensajeAccion(
                error.response?.data?.message ??
                error.message ??
                "No se pudo aprobar el documento."
            );
        } finally {
            setProcesandoDocumentoId(null);
        }
    };

    // ---------------------------------------------------------------
    // Rechazar documento
    // ---------------------------------------------------------------

    const rechazarDocumento = async (id, observacion) => {
        if (procesandoDocumentoId !== null) return;

        if (!observacion?.trim()) {
            setMensajeAccion("Debes escribir el motivo del rechazo.");
            return;
        }

        setProcesandoDocumentoId(id);
        setMensajeAccion("");

        try {
            const respuesta = await rechazarDocumentoRequisito({
                practicaRequisitoDocumentoSubidoRepository,
                id,
                observacion: observacion.trim(),
            });

            const documentoActualizado = respuesta?.data ?? respuesta;

            setDocumentos((actuales) =>
                actuales.map((documento) =>
                    documento.id === id
                        ? { ...documento, ...documentoActualizado }
                        : documento
                )
            );

            const respuestaEmpresas =
                await obtenerEmpresasDocumentosPorPractica({
                    practicaRequisitoDocumentoSubidoRepository,
                    practica_id: practicaId,
                });

            setEmpresas(respuestaEmpresas?.data ?? []);
        } catch (error) {
            console.error("Error al rechazar el documento:", error);

            setMensajeAccion(
                error.response?.data?.message ??
                error.message ??
                "No se pudo rechazar el documento."
            );
        } finally {
            setProcesandoDocumentoId(null);
        }
    };

    // ---------------------------------------------------------------
    // Cerrar modal
    // ---------------------------------------------------------------

    const cerrarModal = () => {
        setModalOpen(false);
        setEmpresaActiva(null);
        setDocumentos([]);
        setMensajeAccion("");
    };

    // ---------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------

    return (
        <div>
            {/* Encabezado */}
            <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                    Documentos de empresas
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Selecciona una práctica para consultar los documentos
                    requeridos y presentados por las empresas.
                </p>
            </div>

            {/* Filtros */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Selector de práctica */}
                    <div>
                        <label
                            htmlFor="select-practica-empresa"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Práctica
                        </label>

                        <select
                            id="select-practica-empresa"
                            value={practicaId}
                            onChange={(e) => {
                                setPracticaId(e.target.value);
                                setBuscarEmpresa("");
                                setModalOpen(false);
                                setEmpresaActiva(null);
                                setDocumentos([]);
                            }}
                            disabled={loadingPracticas}
                            className={selectClass}
                        >
                            <option value="">
                                {loadingPracticas
                                    ? "Cargando prácticas..."
                                    : "Selecciona una práctica"}
                            </option>

                            {practicas.map((practica) => (
                                <option
                                    key={practica.id}
                                    value={practica.id}
                                >
                                    {practica.Periodo?.nombre ??
                                        practica.nombre ??
                                        `Práctica ${practica.id}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Búsqueda por nombre */}
                    <div>
                        <label
                            htmlFor="buscar-empresa"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Empresa
                        </label>

                        <input
                            id="buscar-empresa"
                            type="text"
                            value={buscarEmpresa}
                            onChange={(e) => {
                                setBuscarEmpresa(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Buscar empresa..."
                            disabled={!practicaId}
                            className={selectClass}
                        />
                    </div>
                </div>
            </div>

            {/* Error general */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Tabla */}
            <GenericTable
                rows={empresasFiltradas}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                columns={[
                    {
                        key: "nombre",
                        label: "Empresa",
                        primary: true,
                    },
                    {
                        key: "nit",
                        label: "NIT",
                    },
                    {
                        key: "estado",
                        label: "Estado de documentos",
                    },
                    {
                        key: "documentosResumen",
                        label: "Documentos subidos / requeridos",
                        render: (row) =>
                            `${row.documentosSubidos ?? 0} / ${row.documentosRequeridos ?? 0
                            }`,
                    },
                ]}
                actions={[
                    {
                        icon: <Eye size={18} />,
                        className: "text-red-500 hover:bg-red-100",
                        onClick: verProtocolos,
                    },
                ]}
                emptyMessage={
                    !practicaId
                        ? "Selecciona una práctica para consultar las empresas."
                        : loadingEmpresas
                            ? "Cargando empresas..."
                            : "No hay empresas para esta práctica."
                }
                pageSize={7}
            />

            {loadingEmpresas && (
                <p className="mt-3 text-sm text-gray-500">
                    Cargando empresas y documentos...
                </p>
            )}

            {/* Nota informativa */}
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <Building2
                    size={20}
                    className="mt-0.5 shrink-0 text-gray-400"
                />

                <div>
                    <p className="text-sm font-semibold text-gray-700">
                        Revisión documental empresarial
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        El contador muestra los documentos subidos frente
                        al total de requisitos de la práctica seleccionada.
                        El convenio se revisa por separado.
                    </p>
                </div>
            </div>

            {/* Modal del ojito */}
            <EmpresaDocumentosModal
                open={modalOpen}
                onClose={cerrarModal}
                empresa={empresaActiva}
                documentos={documentos}
                loadingDocumentos={loadingDocumentos}
                onAprobar={aprobarDocumento}
                onRechazar={rechazarDocumento}
                procesandoDocumentoId={procesandoDocumentoId}
                mensajeAccion={mensajeAccion}
            />
        </div>
    );
}


