import React, { useEffect, useState } from "react";
import {
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    FileText,
    GraduationCap,
    AlertCircle,
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { getGruposByPracticaId } from "../../../aplicacion/grupos/getGruposByPracticaId.js";
import { getPracticantesDocumentosByGrupo } from "../../../aplicacion/grupos/getPracticantesDocumentosByGrupo.js";

import { grupoRepository } from "../../../infraestructura/repository/grupoRepository.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { aprobarDocumentoRequisito } from "../../../aplicacion/practicaRequisitoDocumentoSubido/aprobarDocumentoRequisito.js";
import { rechazarDocumentoRequisito } from "../../../aplicacion/practicaRequisitoDocumentoSubido/rechazarDocumentoRequisito.js";

import { obtenerDocumentosPracticantePorPractica } from "../../../aplicacion/practicaRequisitoDocumentoSubido/obtenerDocumentosPracticantePorPractica.js";

import { practicaRequisitoDocumentoSubidoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoSubidoRepository.js";

// -----------------------------------------------------------------------
// Badge de estado
// -----------------------------------------------------------------------

function DocEstadoBadge({ estado }) {
    const styles = {
        APROBADO: "bg-green-100 text-green-700",
        Aceptado: "bg-green-100 text-green-700",
        Subido: "bg-green-100 text-green-700",
        PENDIENTE: "bg-gray-200 text-gray-600",
        Pendiente: "bg-gray-200 text-gray-600",
        RECHAZADO: "bg-red-100 text-red-600",
        Rechazado: "bg-red-100 text-red-600",
    };

    return (
        <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${styles[estado] || styles.Pendiente
                }`}
        >
            {estado}
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
// Modal de documentos
// -----------------------------------------------------------------------

function ProtocoloCarouselModal({
    open,
    onClose,
    candidato,
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
    }, [open, candidato?.id]);

    useEffect(() => {
        setObservacion("");
        setAccion(null);
    }, [index]);

    if (!open) return null;

    const doc = documentos[index];
    const total = documentos.length;

    const procesando = Boolean(doc && procesandoDocumentoId === doc.id);

    const esRechazado =
        doc?.estado === "RECHAZADO" || doc?.estado === "Rechazado";

    const goPrev = () => {
        setIndex((i) => (i - 1 + total) % total);
    };

    const goNext = () => {
        setIndex((i) => (i + 1) % total);
    };

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
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Documentos del practicante
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

                {/* Información del practicante (compacta) */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 px-6 py-3 text-sm text-gray-800 md:grid-cols-4">
                    <p className="truncate">
                        <span className="font-bold">Código:</span>{" "}
                        {candidato?.codigo}
                    </p>

                    <p className="truncate">
                        <span className="font-bold">Nombre:</span>{" "}
                        {candidato?.nombre}
                    </p>

                    <p className="truncate">
                        <span className="font-bold">Estado:</span>{" "}
                        {candidato?.estado}
                    </p>

                    <p className="truncate">
                        <span className="font-bold">Documentos:</span>{" "}
                        {candidato?.documentosResumen}
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
                            Este practicante no tiene documentos cargados para
                            esta práctica.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Nombre del documento + estado */}
                        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                            <p className="truncate pr-3 text-sm font-semibold text-gray-800">
                                {doc.nombre}
                            </p>

                            <DocEstadoBadge estado={doc.estado} />
                        </div>

                        {/* Motivo del rechazo (arriba, visible al revisar) */}
                        {esRechazado && doc.observacion && (
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

                        {/* Visor de documentos */}
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
                                {doc.fileUrl ? (
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

                        {/* Pie del modal: acciones */}
                        <div className="space-y-3 border-t border-gray-100 bg-white px-6 py-4">
                            {mensajeAccion && (
                                <p className="text-center text-sm font-medium text-red-600">
                                    {mensajeAccion}
                                </p>
                            )}

                            {doc.estado === "PENDIENTE" ? (
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
                    placeholderMotivo="Explica qué debe corregir el practicante..."
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
    "w-full min-w-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

// -----------------------------------------------------------------------
// Vista de practicantes
// -----------------------------------------------------------------------

export default function PracticantesProtocolos() {
    // Prácticas
    const [practicas, setPracticas] = useState([]);
    const [loadingPracticas, setLoadingPracticas] = useState(true);
    const [practicaId, setPracticaId] = useState("");

    const [procesandoDocumentoId, setProcesandoDocumentoId] = useState(null);
    const [mensajeAccion, setMensajeAccion] = useState("");

    // Grupos
    const [grupos, setGrupos] = useState([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [grupoId, setGrupoId] = useState("");

    // Practicantes del grupo seleccionado
    const [practicantes, setPracticantes] = useState([]);
    const [loadingPracticantes, setLoadingPracticantes] = useState(false);

    const [error, setError] = useState(null);

    // Tabla / modal
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [candidatoActivo, setCandidatoActivo] = useState(null);

    const [documentos, setDocumentos] = useState([]);
    const [loadingDocumentos, setLoadingDocumentos] = useState(false);

    // -------------------------------------------------------------------
    // Cargar prácticas
    // -------------------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        const cargar = async () => {
            try {
                setLoadingPracticas(true);
                setError(null);

                const data = await getPracticas({
                    practicaRepository,
                });

                if (!cancelled) {
                    setPracticas(data || []);
                }
            } catch (err) {
                console.error("Error cargando prácticas:", err);

                if (!cancelled) {
                    setError("No se pudieron cargar las prácticas.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingPracticas(false);
                }
            }
        };

        cargar();

        return () => {
            cancelled = true;
        };
    }, []);

    // -------------------------------------------------------------------
    // Cargar grupos al seleccionar una práctica
    // -------------------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        setGrupos([]);
        setGrupoId("");
        setPracticantes([]);
        setCurrentPage(1);
        setError(null);

        if (!practicaId) {
            setLoadingGrupos(false);
            setLoadingPracticantes(false);
            return;
        }

        const cargar = async () => {
            try {
                setLoadingGrupos(true);

                const data = await getGruposByPracticaId(
                    { grupoRepository },
                    practicaId
                );

                if (!cancelled) {
                    setGrupos(data || []);
                }
            } catch (err) {
                console.error("Error cargando grupos:", err);

                if (!cancelled) {
                    setError("No se pudieron cargar los grupos.");
                }
            } finally {
                if (!cancelled) {
                    setLoadingGrupos(false);
                }
            }
        };

        cargar();

        return () => {
            cancelled = true;
        };
    }, [practicaId]);

    // -------------------------------------------------------------------
    // Cargar practicantes y conteo documental por grupo
    // -------------------------------------------------------------------

    useEffect(() => {
        let cancelled = false;

        setPracticantes([]);
        setCurrentPage(1);
        setCandidatoActivo(null);
        setModalOpen(false);
        setError(null);

        if (!grupoId) {
            setLoadingPracticantes(false);
            return;
        }

        const cargar = async () => {
            try {
                setLoadingPracticantes(true);

                const data = await getPracticantesDocumentosByGrupo(
                    {
                        grupoRepository,
                        practicaRequisitoDocumentoSubidoRepository,
                    },
                    grupoId
                );

                if (!cancelled) {
                    setPracticantes(data?.practicantes || []);
                }
            } catch (err) {
                console.error(
                    "Error cargando documentos de practicantes:",
                    err
                );

                if (!cancelled) {
                    setError(
                        "No se pudieron cargar los practicantes y sus documentos."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingPracticantes(false);
                }
            }
        };

        cargar();

        return () => {
            cancelled = true;
        };
    }, [grupoId]);

    // -------------------------------------------------------------------
    // Filas de la tabla
    // -------------------------------------------------------------------

    const rows = practicantes.map((p) => {
        const subidos = p.documentosPresentados ?? 0;
        const total = p.totalDocumentos ?? 0;

        return {
            ...p,
            documentosResumen: `${subidos}/${total}`,
            documentosCompleto: total > 0 && subidos === total,
        };
    });

    // -------------------------------------------------------------------
    // Abrir modal de documentos
    // -------------------------------------------------------------------

    const verProtocolos = async (id) => {
        const row = rows.find((p) => String(p.id) === String(id));

        if (!row) return;

        if (!row.usuario_id) {
            setError("No se encontró el usuario del practicante.");
            return;
        }

        if (!practicaId) {
            setError("Selecciona una práctica para continuar.");
            return;
        }

        setCandidatoActivo(row);
        setDocumentos([]);
        setModalOpen(true);
        setLoadingDocumentos(true);
        setMensajeAccion("");
        setError(null);

        try {
            const respuesta = await obtenerDocumentosPracticantePorPractica({
                practicaRequisitoDocumentoSubidoRepository,
                usuario_id: row.usuario_id,
                practica_id: practicaId,
            });

            const documentosObtenidos = respuesta?.data ?? [];

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
        } catch (err) {
            console.error("Error cargando documentos del practicante:", err);

            setError(
                err.response?.data?.message ??
                "No se pudieron cargar los documentos del practicante."
            );
        } finally {
            setLoadingDocumentos(false);
        }
    };

    // -------------------------------------------------------------------
    // Aprobar documento
    // -------------------------------------------------------------------

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
        } catch (err) {
            console.error("Error al aprobar documento:", err);

            setMensajeAccion(
                err.response?.data?.message ??
                err.message ??
                "No se pudo aprobar el documento."
            );
        } finally {
            setProcesandoDocumentoId(null);
        }
    };

    // -------------------------------------------------------------------
    // Rechazar documento
    // -------------------------------------------------------------------

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
        } catch (err) {
            console.error("Error al rechazar documento:", err);

            setMensajeAccion(
                err.response?.data?.message ??
                err.message ??
                "No se pudo rechazar el documento."
            );
        } finally {
            setProcesandoDocumentoId(null);
        }
    };

    // -------------------------------------------------------------------
    // Cerrar modal
    // -------------------------------------------------------------------

    const cerrarModal = () => {
        setModalOpen(false);
        setCandidatoActivo(null);
        setDocumentos([]);
        setMensajeAccion("");
    };

    // -------------------------------------------------------------------
    // Mensaje de tabla vacía
    // -------------------------------------------------------------------

    const emptyMessage = !practicaId
        ? "Selecciona una práctica para continuar."
        : !grupoId
            ? "Selecciona un grupo para ver los practicantes."
            : loadingPracticantes
                ? "Cargando practicantes..."
                : "No hay practicantes en curso o finalizados en este grupo.";

    // -------------------------------------------------------------------
    // Render de la vista
    // -------------------------------------------------------------------

    return (
        <div>
            {/* Encabezado de la sección */}
            <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-800">
                    Documentos de practicantes
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Selecciona una práctica y un grupo para consultar y revisar
                    los documentos presentados.
                </p>
            </div>

            {/* Filtros */}
            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Práctica */}
                    <div className="min-w-0">
                        <label
                            htmlFor="select-practica"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Práctica
                        </label>

                        <select
                            id="select-practica"
                            value={practicaId}
                            disabled={loadingPracticas}
                            onChange={(e) => setPracticaId(e.target.value)}
                            className={selectClass}
                        >
                            {loadingPracticas ? (
                                <option value="">Cargando...</option>
                            ) : (
                                <>
                                    <option value="">
                                        Selecciona una práctica
                                    </option>

                                    {practicas.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.Periodo?.nombre ??
                                                p.nombre ??
                                                `Práctica ${p.id}`}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>

                    {/* Grupo */}
                    <div className="min-w-0">
                        <label
                            htmlFor="select-grupo"
                            className="mb-2 block text-sm font-semibold text-gray-700"
                        >
                            Grupo
                        </label>

                        <select
                            id="select-grupo"
                            value={grupoId}
                            disabled={!practicaId || loadingGrupos}
                            onChange={(e) => setGrupoId(e.target.value)}
                            className={selectClass}
                        >
                            {loadingGrupos ? (
                                <option value="">Cargando...</option>
                            ) : (
                                <>
                                    <option value="">
                                        {practicaId
                                            ? "Selecciona un grupo"
                                            : "Selecciona una práctica primero"}
                                    </option>

                                    {grupos.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.nombre}
                                        </option>
                                    ))}
                                </>
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
            )}

            {/* Tabla */}
            <GenericTable
                rows={grupoId ? rows : []}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                columns={[
                    {
                        key: "codigo",
                        label: "Código",
                        primary: true,
                    },
                    {
                        key: "nombre",
                        label: "Nombre",
                    },
                    {
                        key: "estado",
                        label: "Estado de práctica",
                    },
                    {
                        key: "documentosResumen",
                        label: "# Documentos",
                        render: (row) => (
                            <span
                                className={`font-semibold ${row.documentosCompleto
                                    ? "text-green-600"
                                    : "text-red-500"
                                    }`}
                            >
                                {row.documentosResumen}
                            </span>
                        ),
                    },
                ]}
                actions={[
                    {
                        icon: <Eye size={18} />,
                        className: "text-red-500 hover:bg-red-100",
                        onClick: verProtocolos,
                    },
                ]}
                emptyMessage={emptyMessage}
                pageSize={7}
            />

            {loadingPracticantes && grupoId && (
                <p className="mt-3 text-center text-sm text-gray-500">
                    Cargando practicantes y documentos...
                </p>
            )}

            {/* Nota informativa */}
            <div className="mt-4 flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <GraduationCap
                    size={20}
                    className="mt-0.5 shrink-0 text-gray-400"
                />

                <div>
                    <p className="text-sm font-semibold text-gray-700">
                        Revisión documental de practicantes
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                        El contador muestra los documentos subidos frente al
                        total de requisitos de la práctica seleccionada. El
                        plan de trabajo, el informe parcial y el informe final
                        se revisan por separado: los revisan el tutor docente
                        y el tutor empresarial, y el director los consulta
                        desde otro apartado.
                    </p>
                </div>
            </div>

            {/* Modal compartido para revisar documentos */}
            <ProtocoloCarouselModal
                open={modalOpen}
                onClose={cerrarModal}
                candidato={candidatoActivo}
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