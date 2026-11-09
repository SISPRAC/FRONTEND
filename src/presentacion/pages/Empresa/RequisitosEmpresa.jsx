import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Upload,
    Download,
    Eye,
    FileText,
    RefreshCw,
    ArrowRight,
    CheckCircle2,
    X,
} from "lucide-react";

import EstadoBadge from "../../components/estadoBadge/EstadoBadge";

import { tipoRequisitoDocumentoRepository } from "../../../infraestructura/repository/tipoRequisitoDocumentoRepository";
import { empresaRequisitoDocumentoRepository } from "../../../infraestructura/repository/empresaRequisitoDocumentoRepository";

import { obtenerTiposRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTiposRequisitoDocumento";
import { obtenerDocumentosConvenioEmpresa } from "../../../aplicacion/empresaRequisitoDocumento/obtenerDocumentosConvenioEmpresa";
import { subirDocumentoConvenioEmpresa } from "../../../aplicacion/empresaRequisitoDocumento/subirDocumentoConvenioEmpresa";
import { reemplazarDocumentoConvenioEmpresa } from "../../../aplicacion/empresaRequisitoDocumento/reemplazarDocumentoConvenioEmpresa";

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

function SkeletonRequisitos() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[74px] rounded-xl bg-slate-200" />
            ))}
        </div>
    );
}

// ===============================================================
// MODAL: VISTA PREVIA (ANTES DE SUBIR) / VER DOCUMENTO SUBIDO
// ===============================================================

function ModalDocumento({ modal, subiendo, onCerrar, onConfirmar }) {
    if (!modal) return null;

    const esSubida = modal.modo === "subir";
    const doc = modal.doc;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
            onClick={subiendo ? undefined : onCerrar}
        >
            <div
                className="bg-white w-full max-w-4xl h-[88vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                            <FileText size={21} className="text-red-600" />
                        </div>

                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-slate-800 truncate">
                                {modal.tipo.nombre}
                            </h2>

                            <p className="text-xs text-slate-400 truncate">
                                {esSubida
                                    ? `Vista previa: ${modal.file.name}`
                                    : "Documento enviado"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCerrar}
                        disabled={subiendo}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        title="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ESTADO (solo al ver un documento ya subido) */}
                {!esSubida && doc && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-2.5 bg-slate-50 border-b border-slate-200 shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">Estado</span>
                            <EstadoBadge estado={doc.estado} />
                        </div>

                        {doc.fecha_subida && (
                            <span className="text-xs text-slate-500">
                                Enviado: {formatearFecha(doc.fecha_subida)}
                            </span>
                        )}

                        {doc.estado === "RECHAZADO" && (
                            <p className="w-full text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                                <span className="font-bold">Motivo del rechazo: </span>
                                {doc.observacion || "No se indicó un motivo."}
                            </p>
                        )}
                    </div>
                )}

                {/* AVISO AL REEMPLAZAR */}
                {esSubida && modal.doc && (
                    <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 text-xs text-amber-700 shrink-0">
                        Este documento reemplazará al que ya habías enviado y volverá a
                        quedar pendiente de revisión.
                    </div>
                )}

                {/* VISOR */}
                <div className="flex-1 min-h-0 bg-slate-100 p-2 sm:p-3">
                    {modal.url ? (
                        <iframe
                            src={modal.url}
                            title={modal.tipo.nombre}
                            className="w-full h-full rounded-xl border border-slate-200 bg-white"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-slate-400">
                                No hay una vista previa disponible.
                            </p>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-3 px-5 py-3 border-t border-slate-200 shrink-0">
                    <button
                        type="button"
                        onClick={onCerrar}
                        disabled={subiendo}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {esSubida ? "Cancelar" : "Cerrar"}
                    </button>

                    {esSubida && (
                        <button
                            type="button"
                            onClick={onConfirmar}
                            disabled={subiendo}
                            className="px-5 py-2 rounded-xl bg-[#e8192c] text-white text-sm font-bold hover:bg-[#c91525] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {subiendo ? "Enviando..." : "Aceptar y enviar"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ===============================================================
// COMPONENTE PRINCIPAL
// ===============================================================

export default function RequisitosEmpresa({
    empresaId,
    esPublica,
    onCompletoChange,
    onContinuar,
}) {
    const [requisitos, setRequisitos] = useState([]);
    const [subidos, setSubidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [subiendo, setSubiendo] = useState(false);

    // { modo: "subir" | "ver", tipo, doc, file, url }
    const [modal, setModal] = useState(null);

    const cargar = useCallback(
        async (inicial = false) => {
            const idEmpresa =
                empresaId ||
                JSON.parse(localStorage.getItem("user") || "null")?.Empresa?.id;

            if (!idEmpresa) {
                setCargando(false);
                return;
            }

            try {
                if (inicial) setCargando(true);

                const [tipos, docs] = await Promise.all([
                    obtenerTiposRequisitoDocumento(
                        { tipoRequisitoDocumentoRepository },
                        {
                            es_requisito_convenio: true,
                            tipo_empresa: esPublica ? "publica" : "privada",
                        }
                    ),
                    obtenerDocumentosConvenioEmpresa(
                        { empresaRequisitoDocumentoRepository },
                        idEmpresa
                    ),
                ]);

                console.log("Tipos de requisito:", tipos);
                console.log("Documentos subidos:", docs);

                setRequisitos((tipos || []).filter((t) => t.estado));
                setSubidos(docs || []);
            } catch (error) {
                console.error(error);
                toast.error("No se pudieron cargar los requisitos del convenio");
            } finally {
                if (inicial) setCargando(false);
            }
        },
        [empresaId, esPublica]
    );

    useEffect(() => {
        cargar(true);
    }, [cargar]);

    // Liberar la URL temporal si el componente se desmonta con el modal abierto.
    useEffect(() => {
        return () => {
            if (modal?.modo === "subir" && modal.url) {
                URL.revokeObjectURL(modal.url);
            }
        };
    }, [modal]);

    const subidoPorTipo = useMemo(() => {
        const mapa = {};
        subidos.forEach((d) => {
            mapa[d.tipo_requisito_documento_id] = d;
        });
        return mapa;
    }, [subidos]);

    const obligatorios = requisitos.filter((r) => r.obligatorio);

    const listos = obligatorios.filter((r) => {
        const doc = subidoPorTipo[r.id];
        return doc && doc.estado !== "RECHAZADO";
    }).length;

    const completo = obligatorios.length > 0 && listos === obligatorios.length;

    // Solo avisa cuando ya terminó de cargar (evita un "false" falso al montarse).
    useEffect(() => {
        if (!cargando) onCompletoChange?.(completo);
    }, [cargando, completo, onCompletoChange]);

    // ---------------------------------------------------------------
    // MODAL
    // ---------------------------------------------------------------

    const abrirVistaPrevia = (tipo, file) => {
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("El archivo debe ser un PDF");
            return;
        }

        setModal({
            modo: "subir",
            tipo,
            doc: subidoPorTipo[tipo.id] || null,
            file,
            url: URL.createObjectURL(file),
        });
    };

    const abrirVerDocumento = (tipo, doc) => {
        setModal({
            modo: "ver",
            tipo,
            doc,
            file: null,
            url: doc?.archivo?.url || null,
        });
    };

    const cerrarModal = () => {
        if (subiendo) return;

        if (modal?.modo === "subir" && modal.url) {
            URL.revokeObjectURL(modal.url);
        }

        setModal(null);
    };

    // ---------------------------------------------------------------
    // SUBIR (solo después de aceptar en la vista previa)
    // ---------------------------------------------------------------

    const confirmarSubida = async () => {
        if (!modal || modal.modo !== "subir") return;

        setSubiendo(true);

        try {
            const formData = new FormData();

            formData.append(
                "empresa_id",
                empresaId || JSON.parse(localStorage.getItem("user") || "null")?.Empresa?.id
            );
            formData.append("tipo_requisito_documento_id", modal.tipo.id);
            formData.append("archivo", modal.file);

            const accion = modal.doc
                ? reemplazarDocumentoConvenioEmpresa
                : subirDocumentoConvenioEmpresa;

            await accion(
                { empresaRequisitoDocumentoRepository },
                formData
            );

            toast.success(
                modal.doc
                    ? `${modal.tipo.nombre} reemplazado y enviado a revisión`
                    : `${modal.tipo.nombre} enviado a revisión`
            );

            URL.revokeObjectURL(modal.url);
            setModal(null);

            await cargar();
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message || "No se pudo subir el documento"
            );
        } finally {
            setSubiendo(false);
        }
    };

    const porcentaje = obligatorios.length
        ? Math.round((listos / obligatorios.length) * 100)
        : 100;

    return (
        <div className="flex flex-col gap-4">
            {/* PROGRESO */}
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-3">
                <div className="flex-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                        <span>Requisitos obligatorios</span>
                        <span>
                            {listos} de {obligatorios.length}
                        </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-[#e8192c] transition-all"
                            style={{ width: `${porcentaje}%` }}
                        />
                    </div>
                </div>

                {completo && (
                    <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
                )}
            </div>

            {/* LISTA */}
            {cargando ? (
                <SkeletonRequisitos />
            ) : requisitos.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-10">
                    No hay requisitos configurados para tu tipo de empresa.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto pr-1">
                    {requisitos.map((req) => {
                        const doc = subidoPorTipo[req.id];
                        const aprobado = doc?.estado === "APROBADO";

                        return (
                            <div
                                key={req.id}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex flex-col gap-2"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate">
                                            {req.nombre}
                                        </p>

                                        <p className="text-[11px] text-slate-400">
                                            {req.obligatorio ? "Obligatorio" : "Opcional"}
                                            {doc?.fecha_subida &&
                                                ` · Enviado ${formatearFecha(doc.fecha_subida)}`}
                                        </p>
                                    </div>

                                    {doc ? (
                                        <EstadoBadge estado={doc.estado} />
                                    ) : (
                                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 whitespace-nowrap">
                                            Sin subir
                                        </span>
                                    )}
                                </div>

                                {doc?.estado === "RECHAZADO" && (
                                    <p className="text-[11px] text-red-600 bg-red-50 rounded-lg px-2 py-1">
                                        {doc.observacion || "Documento rechazado."}
                                    </p>
                                )}

                                <div className="flex items-center gap-1 -ml-1">
                                    {req.plantilla?.url && (
                                        <button
                                            type="button"
                                            title="Descargar formato"
                                            onClick={() =>
                                                window.open(
                                                    req.plantilla.url,
                                                    "_blank",
                                                    "noopener,noreferrer"
                                                )
                                            }
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100"
                                        >
                                            <Download size={16} />
                                        </button>
                                    )}

                                    {doc && (
                                        <button
                                            type="button"
                                            title="Ver documento y estado"
                                            onClick={() => abrirVerDocumento(req, doc)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    )}

                                    {!aprobado && (
                                        <label
                                            className={`ml-auto flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-bold cursor-pointer transition-colors ${doc
                                                ? "text-blue-600 hover:bg-blue-50"
                                                : "bg-[#e8192c] text-white hover:bg-[#c91525]"
                                                }`}
                                        >
                                            {doc ? <RefreshCw size={14} /> : <Upload size={14} />}

                                            {doc ? "Reemplazar" : "Subir PDF"}

                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                className="hidden"
                                                onChange={(e) => {
                                                    abrirVistaPrevia(req, e.target.files?.[0]);
                                                    e.target.value = "";
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CONTINUAR */}
            <button
                type="button"
                onClick={onContinuar}
                disabled={!completo}
                className="mx-auto flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-7 py-2.5 rounded-2xl transition-colors"
            >
                Continuar al convenio
                <ArrowRight size={16} />
            </button>

            {/* MODAL */}
            <ModalDocumento
                modal={modal}
                subiendo={subiendo}
                onCerrar={cerrarModal}
                onConfirmar={confirmarSubida}
            />
        </div>
    );
}