import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    Plus, Trash2, X, Building2, CalendarDays, Users, UserPlus, UserCheck,
    Loader2, Send, Eye, Mail, Phone, Languages, Briefcase, Sparkles,
    FileText, ExternalLink,
} from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import toast from "react-hot-toast";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository";
import { habilidadBlandaRepository } from "../../../infraestructura/repository/habilidadBlandaRepository";
import { postulacionRepository } from "../../../infraestructura/repository/postulacionRepository";
import { perfilRepository } from "../../../infraestructura/repository/perfilRepository";
import { getCandidatos } from "../../../aplicacion/candidato/getCandidatos";
import { getHabilidadesBlandas } from "../../../aplicacion/habilidadesBlandas/getHabilidadesBlandas";
import { getPerfiles } from "../../../aplicacion/perfil/getPerfiles";
import { registrarPostulacion } from "../../../aplicacion/postulacion/registrarPostulacion";
import { eliminarPostulacion } from "../../../aplicacion/postulacion/eliminarPostulacion";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";

const ESTADOS_ELIMINABLES = ["POSTULADO"];
const ESTADOS_OCUPAN_CUPO = ["POSTULADO", "ACEPTADO"];

const FILAS_POR_PAGINA = 1000;

const ALTO_TABLA = "h-[clamp(180px,30vh,280px)]";

const SCROLL_TABLA =
    "overflow-y-auto overflow-x-hidden pr-1 " +
    "[scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] " +
    "[&::-webkit-scrollbar]:w-1.5 " +
    "[&::-webkit-scrollbar-track]:bg-transparent " +
    "[&::-webkit-scrollbar-thumb]:rounded-full " +
    "[&::-webkit-scrollbar-thumb]:bg-slate-300 " +
    "hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 " +
    "[&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10 [&_thead_th]:bg-white";

const NIVEL_ORDEN = { MB: 3, B: 2, R: 1 };
const ordenNivel = (n) => NIVEL_ORDEN[n] ?? 0;

const selectClass =
    "border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#e8192c]/40 focus:border-[#e8192c] " +
    "transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

const TABS_DETALLE = [
    { id: "resumen", label: "Resumen", icon: Briefcase },
    { id: "perfiles", label: "Perfiles", icon: Briefcase },
    { id: "habilidades", label: "Habilidades", icon: Sparkles },
    { id: "ingles", label: "Inglés", icon: Languages },
    { id: "cv", label: "Hoja de vida", icon: FileText },
];

// ── Celdas reutilizables ──────────────────────────────────────────────────────

const CeldaNombre = (row) => (
    <div className="leading-tight text-center">
        <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-800 text-[13px]">
            {row.nombre}
        </div>
        <div className="text-[11px] text-slate-400">
            {row.codigo}
        </div>
    </div>
);

const CeldaPerfiles = (row) => {
    const lista = row.perfilesOrdenados ?? [];

    if (lista.length === 0) {
        return <span className="text-gray-300">-</span>;
    }

    const visibles = lista.slice(0, 2);
    const extra = lista.length - visibles.length;

    return (
        <div
            className="flex flex-wrap gap-1"
            title={lista.map((p) => `${p.nombre} - ${p.nivel}`).join(", ")}
        >
            {visibles.map((p) => (
                <span
                    key={p.nombre}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 whitespace-nowrap"
                >
                    {p.nombre} - {p.nivel}
                </span>
            ))}

            {extra > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    +{extra}
                </span>
            )}
        </div>
    );
};

const CeldaBlandas = (row) => {
    const lista = row.habilidadesBlandas ?? [];

    if (lista.length === 0) {
        return <span className="text-gray-300">-</span>;
    }

    const visibles = lista.slice(0, 2);
    const extra = lista.length - visibles.length;

    return (
        <div className="flex flex-wrap gap-1" title={lista.join(", ")}>
            {visibles.map((h) => (
                <span
                    key={h}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 whitespace-nowrap"
                >
                    {h}
                </span>
            ))}

            {extra > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    +{extra}
                </span>
            )}
        </div>
    );
};

// ── Contenido de cada pestaña del detalle ─────────────────────────────────────

const DatoFila = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-gray-100 px-3 py-2.5">
        <Icon size={16} className="text-slate-400 shrink-0" />

        <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
                {label}
            </div>

            <div className="text-sm font-semibold text-slate-700 truncate">
                {value || "-"}
            </div>
        </div>
    </div>
);

const TabContenido = ({ tab, c }) => {
    if (tab === "resumen") {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <DatoFila icon={Mail} label="Correo" value={c.correo} />
                <DatoFila icon={Phone} label="Teléfono" value={c.telefono} />

                <DatoFila
                    icon={Briefcase}
                    label="Perfil principal"
                    value={
                        c.perfilTecnico
                            ? `${c.perfilTecnico} - ${c.nivelPerfilTecnico}`
                            : "-"
                    }
                />

                <DatoFila
                    icon={Languages}
                    label="Nivel de inglés"
                    value={c.nivelIngles}
                />
            </div>
        );
    }

    if (tab === "perfiles") {
        return c.perfiles.length === 0 ? (
            <p className="text-sm text-slate-400">
                Sin perfiles registrados
            </p>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {c.perfiles.map((p) => (
                    <div
                        key={p.nombre}
                        className="flex items-center justify-between rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5"
                    >
                        <span className="text-sm font-semibold text-sky-800">
                            {p.nombre}
                        </span>

                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-sky-700 border border-sky-100">
                            {p.nivel}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    if (tab === "habilidades") {
        return c.habilidadesBlandas.length === 0 ? (
            <p className="text-sm text-slate-400">
                Sin habilidades blandas registradas
            </p>
        ) : (
            <div className="flex flex-wrap gap-2">
                {c.habilidadesBlandas.map((h) => (
                    <span
                        key={h}
                        className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100"
                    >
                        {h}
                    </span>
                ))}
            </div>
        );
    }

    if (tab === "cv") {
        const cv = c.hojaVida;

        if (!cv?.url) {
            return (
                <div className="h-full min-h-[180px] flex flex-col items-center justify-center gap-2 text-slate-400">
                    <FileText size={36} />
                    <p className="text-sm">
                        Este candidato no tiene hoja de vida cargada
                    </p>
                </div>
            );
        }

        return (
            <div className="h-full flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 text-xs text-slate-500">
                        <FileText size={14} className="shrink-0 text-[#e8192c]" />

                        <span className="truncate" title={cv.nombre}>
                            {cv.nombre}
                        </span>
                    </div>

                    <a
                        href={cv.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-[#e8192c] hover:underline"
                    >
                        <ExternalLink size={13} />
                        Abrir en pestaña nueva
                    </a>
                </div>

                <iframe
                    key={cv.url}
                    src={`${cv.url}#toolbar=0&navpanes=0`}
                    title={`Hoja de vida de ${c.nombre}`}
                    className="flex-1 w-full rounded-xl border border-gray-200 bg-white"
                />
            </div>
        );
    }

    // Inglés
    const d = c.detalleIngles ?? {};

    return (
        <div className="grid grid-cols-3 gap-3">
            {[
                ["Lee", d.lee],
                ["Habla", d.habla],
                ["Escucha", d.escucha],
            ].map(([label, val]) => (
                <div
                    key={label}
                    className="rounded-xl border border-gray-100 bg-slate-50 px-3 py-4 text-center"
                >
                    <div className="text-[11px] uppercase tracking-wide text-slate-400">
                        {label}
                    </div>

                    <div className="text-xl font-extrabold text-slate-700 mt-1">
                        {val || "-"}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default function PostularCandidatoModal({
    vacante,
    onClose,
    onSuccess,
}) {
    // ── Catálogos y filtros ───────────────────────────────────────────────────

    const [perfiles, setPerfiles] = useState([]);
    const [habilidadesBlandas, setHabilidadesBlandas] = useState([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [blandaSeleccionada, setBlandaSeleccionada] = useState("");

    // ── Tabla 1: candidatos disponibles ───────────────────────────────────────

    const [candidatos, setCandidatos] = useState([]);
    const [loadingCandidatos, setLoadingCandidatos] = useState(false);
    const [pageDisponibles, setPageDisponibles] = useState(1);

    // ── Tabla 2: elegidos ──────────────────────────────────────────────────────

    const [postulaciones, setPostulaciones] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [pageElegidos, setPageElegidos] = useState(1);

    // ── Detalle del candidato ─────────────────────────────────────────────────

    const [detalleId, setDetalleId] = useState(null);
    const [tabDetalle, setTabDetalle] = useState("resumen");

    const [loading, setLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [error, setError] = useState(null);

    // ── Descripción de la vacante ─────────────────────────────────────────────

    const [descExpandida, setDescExpandida] = useState(false);

    // ── Eliminación ───────────────────────────────────────────────────────────

    const [eliminandoPostulacion, setEliminandoPostulacion] = useState(false);

    // Fila (postulación guardada) pendiente de confirmar su eliminación.
    const [postulacionAEliminar, setPostulacionAEliminar] = useState(null);

    // ── Cupos ─────────────────────────────────────────────────────────────────

    const cuposTotal = Number(vacante?.aperturaVacante?.cupos ?? 0);

    const cuposOcupados =
        postulaciones.filter((p) =>
            ESTADOS_OCUPAN_CUPO.includes(p.estado)
        ).length + seleccionados.length;

    const cuposRestantes = Math.max(0, cuposTotal - cuposOcupados);
    const puedeAgregar = cuposRestantes > 0;

    const porcentajeCupos =
        cuposTotal > 0
            ? Math.min(100, (cuposOcupados / cuposTotal) * 100)
            : 0;

    // ── Carga inicial: catálogos + candidatos ─────────────────────────────────

    useEffect(() => {
        const cargar = async () => {
            setLoadingCandidatos(true);

            try {
                const [
                    perfilesData,
                    blandasRes,
                    candidatosData,
                ] = await Promise.all([
                    getPerfiles({ perfilRepository }),
                    getHabilidadesBlandas({ habilidadBlandaRepository }),
                    getCandidatos({ candidatoRepository }),
                ]);

                setPerfiles(perfilesData ?? []);

                const blandasArr = Array.isArray(blandasRes)
                    ? blandasRes
                    : blandasRes?.data;

                setHabilidadesBlandas(
                    (Array.isArray(blandasArr) ? blandasArr : []).map((h) =>
                        typeof h === "string" ? h : h.nombre
                    )
                );

                setCandidatos(
                    (candidatosData ?? []).map((c) => ({
                        id: Number(c.id),
                        codigo: c.codigo,
                        nombre: c.nombre,
                        correo: c.correo,
                        telefono: c.telefono,
                        perfilTecnico: c.perfilTecnico,
                        nivelPerfilTecnico: c.nivelPerfilTecnico,
                        perfiles: c.perfiles ?? [],
                        habilidadesBlandas: c.habilidadesBlandas ?? [],
                        nivelIngles: c.nivelIngles,
                        detalleIngles: c.detalleIngles ?? null,
                        hojaVida: c.hojaVida?.url
                            ? {
                                id: c.hojaVida.id,
                                nombre: c.hojaVida.nombre,
                                url: c.hojaVida.url,
                            }
                            : null,
                    }))
                );
            } catch (err) {
                console.error(err);
                setError("Error cargando candidatos");
            } finally {
                setLoadingCandidatos(false);
            }
        };

        cargar();
    }, []);

    // ── Postulaciones existentes ──────────────────────────────────────────────

    useEffect(() => {
        const existentes =
            vacante?.aperturaVacante?.Postulacions?.map((item) => ({
                id: Number(item.id),
                candidatoId: Number(
                    item.candidato_id ??
                    item.candidatoId ??
                    item.Candidato?.id
                ),
                codigo: item.Candidato?.codigo,
                nombre: `${item.Candidato?.Usuario?.nombres ?? ""} ${item.Candidato?.Usuario?.apellidos ?? ""}`.trim(),
                correo: item.Candidato?.Usuario?.correo ?? "",
                estado: item.estado,
                comentarioEmpresa: item.comentarioEmpresa ?? null,
            })) || [];

        setPostulaciones(existentes);
    }, [vacante]);

    // ── Al cambiar un filtro, volver a la página 1 ─────────────────────────────

    useEffect(() => {
        setPageDisponibles(1);
    }, [perfilSeleccionado, blandaSeleccionada]);

    // ── Candidatos disponibles ────────────────────────────────────────────────

    const idsOcupados = new Set([
        ...postulaciones
            .filter((p) => ESTADOS_OCUPAN_CUPO.includes(p.estado))
            .map((p) => Number(p.candidatoId)),

        ...seleccionados.map((e) => Number(e.id)),
    ]);

    const candidatosFiltrados = candidatos
        .filter((c) => !idsOcupados.has(c.id))
        .filter(
            (c) =>
                !perfilSeleccionado ||
                c.perfiles.some((p) => p.nombre === perfilSeleccionado)
        )
        .filter(
            (c) =>
                !blandaSeleccionada ||
                c.habilidadesBlandas.includes(blandaSeleccionada)
        )
        .map((c) => {
            const perfilesOrdenados = [...c.perfiles].sort((a, b) => {
                if (perfilSeleccionado) {
                    if (a.nombre === perfilSeleccionado) return -1;
                    if (b.nombre === perfilSeleccionado) return 1;
                }

                return ordenNivel(b.nivel) - ordenNivel(a.nivel);
            });

            const nivelOrden = perfilSeleccionado
                ? ordenNivel(
                    c.perfiles.find(
                        (x) => x.nombre === perfilSeleccionado
                    )?.nivel
                )
                : Math.max(
                    0,
                    ...c.perfiles.map((p) => ordenNivel(p.nivel))
                );

            return {
                ...c,
                perfilesOrdenados,
                nivelOrden,
            };
        })
        .sort((a, b) => b.nivelOrden - a.nivelOrden);

    // ── Candidato que se muestra en el detalle ────────────────────────────────

    const candidatoDetalle =
        candidatos.find((c) => c.id === detalleId) ?? null;

    const detalleYaElegido = candidatoDetalle
        ? idsOcupados.has(candidatoDetalle.id)
        : false;

    // ── Acciones ──────────────────────────────────────────────────────────────

    const agregarCandidato = (id) => {
        if (!puedeAgregar) {
            toast.error("No hay cupos disponibles");
            return false;
        }

        const candidato = candidatos.find(
            (c) => c.id === Number(id)
        );

        if (!candidato) return false;

        setSeleccionados((prev) => [...prev, candidato]);

        return true;
    };

    const abrirDetalle = (id) => {
        setTabDetalle("resumen");
        setDetalleId(Number(id));
    };

    const agregarDesdeDetalle = () => {
        if (!candidatoDetalle) return;

        if (agregarCandidato(candidatoDetalle.id)) {
            toast.success("Candidato agregado");
            setDetalleId(null);
        }
    };

    // Quitar un candidato que todavía no se ha guardado.
    const quitarSeleccionado = (id) => {
        const candidatoId = Number(
            String(id).replace("nuevo-", "")
        );

        setSeleccionados((prev) =>
            prev.filter((e) => Number(e.id) !== candidatoId)
        );
    };

    // ── Eliminar: paso 1 (decidir qué hacer al darle a la basura) ─────────────

    const solicitarEliminacion = (row) => {
        if (!row || eliminandoPostulacion) return;

        // Candidato NUEVO (sin guardar): se quita directo.
        if (row.esNuevo) {
            quitarSeleccionado(row.id);
            toast.success("Candidato quitado de la selección");
            return;
        }

        // Solo se pueden eliminar postulaciones pendientes.
        if (!ESTADOS_ELIMINABLES.includes(row.estado)) {
            toast.error("Solo puedes eliminar postulaciones pendientes");
            return;
        }

        // POSTULADO: abrir el modal de confirmación.
        setPostulacionAEliminar(row);
    };

    const confirmarEliminacion = async () => {
        const row = postulacionAEliminar;

        if (!row || eliminandoPostulacion) return;

        setEliminandoPostulacion(true);

        try {
            await eliminarPostulacion(
                postulacionRepository,
                vacante?.aperturaVacante?.id,
                row.candidatoId
            );

            setPostulaciones((prev) =>
                prev.filter((p) => Number(p.id) !== Number(row.id))
            );

            toast.success("Postulación eliminada correctamente");

            await onSuccess?.();
        } catch (err) {
            console.error("Error eliminando postulación:", err);

            toast.error(
                err?.response?.data?.message ||
                "Error eliminando postulación"
            );
        } finally {
            setEliminandoPostulacion(false);
            setPostulacionAEliminar(null);
        }
    };

    // ── Presentar candidatos ─────────────────────────────────────────────────

    const handlePresentar = async () => {
        if (seleccionados.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const nuevas = await registrarPostulacion(
                { postulacionRepository },
                vacante?.aperturaVacante?.id,
                seleccionados.map((e) => e.id)
            );

            const nuevasFilas = seleccionados.map((c, index) => ({
                id: Number(nuevas?.[index]?.id ?? Date.now() + index),
                candidatoId: c.id,
                codigo: c.codigo,
                nombre: c.nombre,
                correo: c.correo,
                estado: "POSTULADO",
                comentarioEmpresa: null,
            }));

            setPostulaciones((prev) => [
                ...prev,
                ...nuevasFilas,
            ]);

            setSeleccionados([]);

            toast.success("Candidatos postulados correctamente");

            onSuccess?.();
        } catch (err) {
            console.error("ERROR POSTULANDO:", err);

            setError(
                err?.response?.data?.message ||
                "Error al postular candidatos"
            );
        } finally {
            setLoading(false);
            setConfirmOpen(false);
        }
    };

    // ── Filas de la tabla 2 ───────────────────────────────────────────────────

    const filasElegidos = [
        ...postulaciones.map((p) => ({
            ...p,
            esNuevo: false,
        })),

        ...seleccionados.map((e) => ({
            ...e,
            id: `nuevo-${e.id}`,
            candidatoId: Number(e.id),
            estado: "NUEVO",
            esNuevo: true,
        })),
    ];

    if (!vacante) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
                background: "rgba(15,23,42,0.55)",
                backdropFilter: "blur(2px)",
            }}
            onClick={(e) => {
                if (
                    e.target === e.currentTarget &&
                    !loading &&
                    !eliminandoPostulacion
                ) {
                    onClose?.();
                }
            }}
        >
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[94vh]">

                {/* ── Encabezado ─────────────────────────────────────────── */}

                <div className="relative bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
                    <div className="absolute left-0 top-0 h-full w-1.5 bg-[#e8192c]" />

                    <div className="pl-2">
                        <h2 className="text-xl font-extrabold text-slate-800 leading-tight">
                            Presentar candidatos
                        </h2>

                        <p className="text-xs text-slate-400">
                            Filtra, agrega candidatos y presenta tu selección
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={loading || eliminandoPostulacion}
                        className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Cuerpo ─────────────────────────────────────────────── */}

                <div className="flex-1 min-h-0 overflow-hidden px-6 py-4 flex flex-col gap-4">

                    {/* Información de la vacante */}

                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-sm shrink-0">

                        <div className="flex items-center gap-2 min-w-0">
                            <Building2 size={16} className="text-slate-400 shrink-0" />

                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400">
                                    Empresa
                                </div>

                                <div className="font-semibold text-slate-700 truncate">
                                    {vacante.empresa?.nombre}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                            <CalendarDays size={16} className="text-slate-400 shrink-0" />

                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400">
                                    Periodo
                                </div>

                                <div className="font-semibold text-slate-700 truncate">
                                    {vacante.periodo?.nombre}
                                </div>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    Cupos
                                </span>

                                <span
                                    className={`font-bold normal-case text-sm ${cuposRestantes === 0
                                        ? "text-red-500"
                                        : "text-green-600"
                                        }`}
                                >
                                    {cuposOcupados}/{cuposTotal}
                                </span>
                            </div>

                            <div className="h-2 mt-1 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${cuposRestantes === 0
                                        ? "bg-red-500"
                                        : "bg-green-500"
                                        }`}
                                    style={{
                                        width: `${porcentajeCupos}%`,
                                    }}
                                />
                            </div>

                            <div className="text-[11px] text-slate-400 mt-0.5">
                                {cuposRestantes} disponibles
                            </div>
                        </div>

                        {vacante.descripcion && (
                            <div className="md:col-span-3 border-t border-gray-100 pt-2">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                                    Descripción
                                </div>

                                <p
                                    className={`text-xs text-slate-600 leading-relaxed whitespace-pre-line break-words ${descExpandida
                                        ? `max-h-48 ${SCROLL_TABLA}`
                                        : "line-clamp-2"
                                        }`}
                                >
                                    {vacante.descripcion}
                                </p>

                                {vacante.descripcion.length > 150 && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setDescExpandida((v) => !v)
                                        }
                                        className="mt-1 text-[11px] font-semibold text-[#e8192c] hover:underline"
                                    >
                                        {descExpandida ? "Ver menos" : "Ver más"}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Dos tablas lado a lado ─────────────────────────── */}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                        {/* TABLA 1: candidatos disponibles */}

                        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 min-w-0">

                            <div className="flex items-center justify-between">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                    <UserPlus size={16} className="text-[#e8192c]" />

                                    Candidatos disponibles

                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                        {candidatosFiltrados.length}
                                    </span>
                                </h3>
                            </div>

                            {/* Filtros */}

                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                        Perfil
                                    </label>

                                    <select
                                        value={perfilSeleccionado}
                                        onChange={(e) =>
                                            setPerfilSeleccionado(e.target.value)
                                        }
                                        className={selectClass}
                                    >
                                        <option value="">
                                            Todos los perfiles
                                        </option>

                                        {perfiles.map((p) => (
                                            <option key={p.id} value={p.nombre}>
                                                {p.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                        Habilidades blandas
                                    </label>

                                    <select
                                        value={blandaSeleccionada}
                                        onChange={(e) =>
                                            setBlandaSeleccionada(e.target.value)
                                        }
                                        disabled={habilidadesBlandas.length === 0}
                                        className={selectClass}
                                    >
                                        <option value="">Todas</option>

                                        {habilidadesBlandas.map((b) => (
                                            <option key={b} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={`${ALTO_TABLA} ${SCROLL_TABLA}`}>
                                <GenericTable
                                    rows={candidatosFiltrados}
                                    currentPage={pageDisponibles}
                                    onPageChange={setPageDisponibles}
                                    columns={[
                                        {
                                            key: "nombre",
                                            label: "Candidato",
                                            primary: true,
                                            render: CeldaNombre,
                                        },
                                        {
                                            key: "perfilesOrdenados",
                                            label: "Perfiles",
                                            render: CeldaPerfiles,
                                        },
                                        {
                                            key: "habilidadesBlandas",
                                            label: "Hab. blandas",
                                            render: CeldaBlandas,
                                        },
                                    ]}
                                    actions={[
                                        {
                                            icon: <Eye size={14} />,
                                            className: "text-gray-400 hover:bg-sky-50 hover:text-sky-600",
                                            onClick: (id) => abrirDetalle(id),
                                        },
                                        {
                                            icon: <Plus size={14} />,
                                            className: puedeAgregar
                                                ? "text-gray-400 hover:bg-green-50 hover:text-green-600"
                                                : "text-gray-300 cursor-not-allowed",
                                            onClick: (id) => agregarCandidato(id),
                                        },
                                    ]}
                                    emptyMessage={
                                        loadingCandidatos
                                            ? "Cargando…"
                                            : "Sin candidatos disponibles"
                                    }
                                    pageSize={FILAS_POR_PAGINA}
                                />
                            </div>
                        </section>

                        {/* TABLA 2: candidatos elegidos */}

                        <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 min-w-0">

                            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <UserCheck size={16} className="text-green-600" />

                                Candidatos elegidos

                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    {filasElegidos.length}
                                </span>

                                {seleccionados.length > 0 && (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                        {seleccionados.length} sin guardar
                                    </span>
                                )}
                            </h3>

                            <div className={`${ALTO_TABLA} ${SCROLL_TABLA}`}>
                                <GenericTable
                                    rows={filasElegidos}
                                    currentPage={pageElegidos}
                                    onPageChange={setPageElegidos}
                                    columns={[
                                        {
                                            key: "nombre",
                                            label: "Candidato",
                                            primary: true,
                                            render: CeldaNombre,
                                        },
                                        {
                                            key: "estado",
                                            label: "Estado",
                                            render: (row) =>
                                                row.esNuevo ? (
                                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                                        Nuevo
                                                    </span>
                                                ) : (
                                                    <EstadoBadge estado={row.estado} />
                                                ),
                                        },
                                        {
                                            key: "comentarioEmpresa",
                                            label: "Motivo de rechazo",
                                            render: (row) =>
                                                row.estado === "RECHAZADO" ? (
                                                    <span className="text-xs text-red-600 block whitespace-normal break-words min-w-[180px] max-w-[250px]">
                                                        {row.comentarioEmpresa || "Sin motivo especificado"}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300">
                                                        -
                                                    </span>
                                                ),
                                        },
                                    ]}
                                    actions={[
                                        {
                                            icon: <Trash2 size={14} />,
                                            className: "text-gray-400 hover:bg-red-50 hover:text-red-500",
                                            onClick: (id, row) => {
                                                const fila =
                                                    row ?? filasElegidos.find((f) => String(f.id) === String(id));
                                                solicitarEliminacion(fila);
                                            },
                                        },
                                    ]}
                                    emptyMessage="Agrega candidatos para postular"
                                    pageSize={FILAS_POR_PAGINA}
                                />
                            </div>
                        </section>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500 text-center">
                            {error}
                        </p>
                    )}
                </div>

                {/* ── Pie ────────────────────────────────────────────────── */}

                <div className="flex items-center justify-end gap-3 px-6 py-3 bg-white border-t border-gray-100 shrink-0">
                    <button
                        onClick={onClose}
                        disabled={loading || eliminandoPostulacion}
                        className="px-6 py-2 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all duration-150 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={() => setConfirmOpen(true)}
                        disabled={seleccionados.length === 0 || loading || eliminandoPostulacion}
                        className={`
                            px-7 py-2 rounded-xl text-sm font-bold transition-all duration-150
                            ${seleccionados.length > 0 && !loading
                                ? "bg-[#e8192c] hover:bg-[#c8111f] text-white shadow-md shadow-red-200 active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }
                        `}
                    >
                        {`Presentar${seleccionados.length ? ` (${seleccionados.length})` : ""}`}
                    </button>
                </div>
            </div>

            {/* ── Modal de detalle del candidato ─────────────────────────── */}

            {candidatoDetalle && (
                <div
                    className="fixed inset-0 z-[70] flex items-center justify-center p-4"
                    style={{ background: "rgba(15,23,42,0.6)" }}
                    onClick={(e) => {
                        e.stopPropagation();

                        if (e.target === e.currentTarget) {
                            setDetalleId(null);
                        }
                    }}
                >
                    <div
                        className={`bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col transition-all ${tabDetalle === "cv"
                            ? "max-w-4xl h-[90vh]"
                            : "max-w-lg max-h-[85vh]"
                            }`}
                    >
                        {/* Cabecera */}

                        <div className="relative px-6 py-4 border-b border-gray-100 flex items-start justify-between shrink-0">
                            <div className="absolute left-0 top-0 h-full w-1.5 bg-[#e8192c]" />

                            <div className="pl-2 leading-tight min-w-0">
                                <h3 className="text-lg font-extrabold text-slate-800 truncate">
                                    {candidatoDetalle.nombre}
                                </h3>

                                <p className="text-xs text-slate-400">
                                    Código {candidatoDetalle.codigo}
                                </p>
                            </div>

                            <button
                                onClick={() => setDetalleId(null)}
                                className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Barra de pestañas */}

                        <div className="px-4 pt-3 shrink-0">
                            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                                {TABS_DETALLE.map(
                                    ({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setTabDetalle(id)}
                                            className={`
                                                flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5
                                                text-xs font-semibold transition-all
                                                ${tabDetalle === id
                                                    ? "bg-white text-slate-800 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700"
                                                }
                                            `}
                                        >
                                            <Icon size={13} />
                                            <span className="truncate">
                                                {label}
                                            </span>
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Contenido de la pestaña */}

                        <div
                            className={`flex-1 min-h-0 ${tabDetalle === "cv"
                                ? "p-3 overflow-hidden"
                                : `px-6 py-4 min-h-[180px] ${SCROLL_TABLA}`
                                }`}
                        >
                            <TabContenido
                                tab={tabDetalle}
                                c={candidatoDetalle}
                            />
                        </div>

                        {/* Pie */}

                        <div className="flex items-center justify-end gap-3 px-6 py-3 bg-slate-50 border-t border-gray-100 shrink-0">
                            <button
                                onClick={() => setDetalleId(null)}
                                className="px-5 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all duration-150"
                            >
                                Cerrar
                            </button>

                            <button
                                onClick={agregarDesdeDetalle}
                                disabled={!puedeAgregar || detalleYaElegido}
                                className={`
                                    flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all duration-150
                                    ${puedeAgregar && !detalleYaElegido
                                        ? "bg-[#e8192c] hover:bg-[#c8111f] text-white shadow-md shadow-red-200 active:scale-95"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }
                                `}
                            >
                                <Plus size={15} />

                                {detalleYaElegido
                                    ? "Ya agregado"
                                    : !puedeAgregar
                                        ? "Sin cupos"
                                        : "Agregar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal de confirmación para presentar candidatos ───────── */}

            {confirmOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    style={{ background: "rgba(15,23,42,0.6)" }}
                    onClick={(e) => {
                        e.stopPropagation();

                        if (
                            e.target === e.currentTarget &&
                            !loading
                        ) {
                            setConfirmOpen(false);
                        }
                    }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="px-6 pt-6 pb-4 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#e8192c]">
                                <Send size={22} />
                            </div>

                            <h3 className="text-lg font-extrabold text-slate-800">
                                ¿Presentar candidatos?
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                Vas a postular {seleccionados.length}{" "}
                                {seleccionados.length === 1
                                    ? "candidato"
                                    : "candidatos"}{" "}
                                a la vacante
                                {vacante.empresa?.nombre
                                    ? ` de ${vacante.empresa.nombre}`
                                    : ""}.
                            </p>

                            <p className="mt-2 text-xs text-slate-500">
                                Se notificará a la empresa sobre la presentación
                                de los candidatos para que pueda revisar sus
                                perfiles y gestionar las postulaciones.
                            </p>
                        </div>

                        <ul className="mx-6 mb-4 max-h-40 overflow-y-auto divide-y divide-gray-100 rounded-xl border border-gray-100 bg-slate-50">
                            {seleccionados.map((c) => (
                                <li
                                    key={c.id}
                                    className="px-3 py-2 leading-tight"
                                >
                                    <div className="text-[13px] font-semibold text-slate-700">
                                        {c.nombre}
                                    </div>

                                    <div className="text-[11px] text-slate-400">
                                        {c.codigo}
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-gray-100">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                disabled={loading}
                                className="px-5 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>

                            <button
                                onClick={handlePresentar}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-[#e8192c] hover:bg-[#c8111f] text-white shadow-md shadow-red-200 active:scale-95 transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Presentando…
                                    </>
                                ) : (
                                    "Sí, presentar"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal de confirmación para ELIMINAR postulación ────────── */}
            {/* Se dibuja con un portal en <body> para que quede por encima de todo */}

            {postulacionAEliminar &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        style={{ background: "rgba(15,23,42,0.6)" }}
                        onClick={(e) => {
                            e.stopPropagation();

                            if (
                                e.target === e.currentTarget &&
                                !eliminandoPostulacion
                            ) {
                                setPostulacionAEliminar(null);
                            }
                        }}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="px-6 pt-6 pb-4 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <Trash2 size={22} />
                                </div>

                                <h3 className="text-lg font-extrabold text-slate-800">
                                    ¿Eliminar postulación?
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Vas a eliminar la postulación de{" "}
                                    <span className="font-semibold text-slate-700">
                                        {postulacionAEliminar.nombre}
                                    </span>
                                    {vacante.empresa?.nombre
                                        ? ` a la vacante de ${vacante.empresa.nombre}`
                                        : ""}
                                    .
                                </p>

                                <p className="mt-2 text-xs text-slate-500">
                                    Esta acción no se puede deshacer.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-gray-100">
                                <button
                                    onClick={() => setPostulacionAEliminar(null)}
                                    disabled={eliminandoPostulacion}
                                    className="px-5 py-2 rounded-xl text-sm font-bold bg-white border border-gray-200 hover:bg-slate-100 text-slate-600 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>

                                <button
                                    onClick={confirmarEliminacion}
                                    disabled={eliminandoPostulacion}
                                    className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-[#e8192c] hover:bg-[#c8111f] text-white shadow-md shadow-red-200 active:scale-95 transition-all duration-150 disabled:opacity-80 disabled:cursor-not-allowed"
                                >
                                    {eliminandoPostulacion ? (
                                        <>
                                            <Loader2
                                                size={16}
                                                className="animate-spin"
                                            />
                                            Eliminando…
                                        </>
                                    ) : (
                                        "Sí, eliminar"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}