import { useEffect, useState } from "react";
import { Plus, Trash2, X, Building2, CalendarDays, Users, UserPlus, UserCheck } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import toast from "react-hot-toast";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository";
import { postulacionRepository } from "../../../infraestructura/repository/postulacionRepository";
import { perfilRepository } from "../../../infraestructura/repository/perfilRepository";
import { getCandidatosPerfil } from "../../../aplicacion/perfil/getCandidatoPerfiles";
import { getPerfiles } from "../../../aplicacion/perfil/getPerfiles";
import { registrarPostulacion } from "../../../aplicacion/postulacion/registrarPostulacion";
import { eliminarPostulacion } from "../../../aplicacion/postulacion/eliminarPostulacion";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";

const ESTADOS_ELIMINABLES = ["POSTULADO"];
const ESTADOS_OCUPAN_CUPO = ["POSTULADO", "ACEPTADO"];

// Máximo de filas por tabla y alto fijo del contenedor de la tabla
// (encabezado + 3 filas + paginación). Si ves que se corta o sobra
// espacio, ajusta solo ESTE valor.
const FILAS_POR_PAGINA = 3;
const ALTO_TABLA = "h-[250px]";

const selectClass =
    "border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-[#e8192c]/40 focus:border-[#e8192c] " +
    "transition-all cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed";

// ── Celdas reutilizables ──────────────────────────────────────────────────────
const CeldaNombre = (row) => (
    <div className="leading-tight">
        <div className="font-semibold text-slate-800 text-[13px]">{row.nombre}</div>
        <div className="text-[11px] text-slate-400">{row.codigo}</div>
    </div>
);

const CeldaPerfil = (row) =>
    row.perfilCalificacion && row.perfilCalificacion !== "-" ? (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 whitespace-nowrap">
            {row.perfilCalificacion}
        </span>
    ) : (
        <span className="text-gray-300">-</span>
    );

const CeldaBlandas = (row) =>
    row.habilidadesBlandas && row.habilidadesBlandas !== "-" ? (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 whitespace-nowrap">
            {row.habilidadesBlandas}
        </span>
    ) : (
        <span className="text-gray-300">-</span>
    );

export default function PostularCandidatoModal({ vacante, onClose, onSuccess }) {
    // ── Filtros (tabla 1) ─────────────────────────────────────────────────────
    const [perfiles, setPerfiles] = useState([]);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [blandaSeleccionada, setBlandaSeleccionada] = useState("");

    // ── Tabla 1: candidatos disponibles ───────────────────────────────────────
    const [candidatosDisponibles, setCandidatosDisponibles] = useState([]);
    const [loadingCandidatos, setLoadingCandidatos] = useState(false);
    const [pageDisponibles, setPageDisponibles] = useState(1);

    // ── Tabla 2: elegidos (BD + nuevos de esta sesión) ────────────────────────
    const [postulaciones, setPostulaciones] = useState([]);
    const [seleccionados, setSeleccionados] = useState([]);
    const [pageElegidos, setPageElegidos] = useState(1);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ── Cupos ─────────────────────────────────────────────────────────────────
    const cuposTotal = Number(vacante?.aperturaVacante?.cupos ?? 0);
    const cuposOcupados =
        postulaciones.filter((p) => ESTADOS_OCUPAN_CUPO.includes(p.estado)).length +
        seleccionados.length;
    const cuposRestantes = Math.max(0, cuposTotal - cuposOcupados);
    const puedeAgregar = cuposRestantes > 0;
    const porcentajeCupos = cuposTotal > 0 ? Math.min(100, (cuposOcupados / cuposTotal) * 100) : 0;

    const perfilNombreSeleccionado =
        perfiles.find((p) => p.id === Number(perfilSeleccionado))?.nombre ?? "";

    // ── Carga perfiles + postulaciones existentes al montar ───────────────────
    useEffect(() => {
        cargarPerfiles();

        const existentes =
            vacante?.aperturaVacante?.Postulacions?.map((item) => ({
                id: item.id,
                candidatoId: Number(
                    item.candidato_id ?? item.candidatoId ?? item.Candidato?.id
                ),
                codigo: item.Candidato?.codigo,
                nombre: `${item.Candidato?.Usuario?.nombres ?? ""} ${item.Candidato?.Usuario?.apellidos ?? ""}`.trim(),
                correo: item.Candidato?.Usuario?.correo ?? "",
                estado: item.estado,
                perfilCalificacion: "-",
                // TODO backend: perfil de habilidades blandas
                habilidadesBlandas: item.Candidato?.perfilHabilidadesBlandas ?? "-",
            })) || [];

        setPostulaciones(existentes);
    }, [vacante]);

    const cargarPerfiles = async () => {
        try {
            const data = await getPerfiles({ perfilRepository });
            setPerfiles(data);
        } catch (err) {
            console.error(err);
            setError("Error cargando perfiles");
        }
    };

    // ── Cuando cambia el perfil: recalcular "perfil + calificación" de los ya
    //    postulados y cargar candidatos disponibles ───────────────────────────
    useEffect(() => {
        setPageDisponibles(1);
        setBlandaSeleccionada("");

        if (!perfilSeleccionado) {
            setCandidatosDisponibles([]);
            return;
        }

        setPostulaciones((prev) =>
            prev.map((postulacion) => {
                const candidato = vacante?.aperturaVacante?.Postulacions?.find(
                    (p) => p.id === postulacion.id
                )?.Candidato;
                const perfilCandidato = candidato?.Perfils?.find(
                    (p) => p.id === Number(perfilSeleccionado)
                );
                const calif = perfilCandidato?.Candidato_perfil?.calificacion;
                return {
                    ...postulacion,
                    perfilCalificacion:
                        calif !== undefined && calif !== null
                            ? `${perfilNombreSeleccionado} - ${calif}`
                            : "-",
                };
            })
        );

        cargarCandidatos(perfilSeleccionado);
    }, [perfilSeleccionado]);

    // Al cambiar el filtro de habilidades blandas, volver a la página 1
    useEffect(() => {
        setPageDisponibles(1);
    }, [blandaSeleccionada]);

    const cargarCandidatos = async (perfilId) => {
        setLoadingCandidatos(true);
        setError(null);

        try {
            const perfil = perfiles.find((p) => p.id === Number(perfilId));
            if (!perfil) {
                setCandidatosDisponibles([]);
                return;
            }

            const data = await getCandidatosPerfil(
                { candidatoRepository },
                perfil.nombre
            );

            if (!data || data.length === 0) {
                setCandidatosDisponibles([]);
                return;
            }

            const normalizados = data.map((candidato) => {
                const perfilCandidato = candidato.Perfils?.find(
                    (p) => p.id === Number(perfilId)
                );
                const calificacion =
                    perfilCandidato?.Candidato_perfil?.calificacion ?? 0;

                return {
                    id: Number(candidato.id),
                    codigo: candidato.codigo,
                    nombre: `${candidato.Usuario?.nombres ?? ""} ${candidato.Usuario?.apellidos ?? ""}`.trim(),
                    correo: candidato.Usuario?.correo ?? "",
                    calificacion,
                    perfilCalificacion: `${perfil.nombre} - ${calificacion}`,
                    // TODO backend: perfil de habilidades blandas
                    habilidadesBlandas: candidato.perfilHabilidadesBlandas ?? "-",
                };
            });

            setCandidatosDisponibles(normalizados);
        } catch (err) {
            console.error("Error cargando candidatos:", err);
            setCandidatosDisponibles([]);
            setError("Error cargando candidatos");
        } finally {
            setLoadingCandidatos(false);
        }
    };

    // Opciones del filtro de habilidades blandas (salen de los candidatos
    // cargados; cuando el backend tenga catálogo se reemplaza por ese).
    const opcionesBlandas = [
        ...new Set(
            candidatosDisponibles
                .map((c) => c.habilidadesBlandas)
                .filter((v) => v && v !== "-")
        ),
    ];

    // ── Candidatos disponibles = todos menos los ya elegidos, con filtros ─────
    const idsOcupados = new Set([
        ...postulaciones
            .filter((p) => ESTADOS_OCUPAN_CUPO.includes(p.estado))
            .map((p) => Number(p.candidatoId)),
        ...seleccionados.map((e) => Number(e.id)),
    ]);

    const candidatosFiltrados = candidatosDisponibles
        .filter((c) => !idsOcupados.has(Number(c.id)))
        .filter((c) => !blandaSeleccionada || c.habilidadesBlandas === blandaSeleccionada)
        .sort((a, b) => b.calificacion - a.calificacion);

    // ── Acciones ──────────────────────────────────────────────────────────────
    const agregarCandidato = (id) => {
        if (!puedeAgregar) {
            toast.error("No hay cupos disponibles");
            return;
        }
        const candidato = candidatosFiltrados.find((c) => c.id === Number(id));
        if (!candidato) return;
        setSeleccionados((prev) => [...prev, candidato]);
    };

    const quitarSeleccionado = (id) => {
        setSeleccionados((prev) => prev.filter((e) => e.id !== id));
    };

    const handleEliminarPostulacion = async (postulacion) => {
        if (!ESTADOS_ELIMINABLES.includes(postulacion.estado)) return;

        try {
            await eliminarPostulacion(
                postulacionRepository,
                vacante?.aperturaVacante?.id,
                postulacion.candidatoId
            );
            setPostulaciones((prev) => prev.filter((p) => p.id !== postulacion.id));
            toast.success("Postulación eliminada correctamente");
            onSuccess?.();
        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.message || "Error eliminando postulación"
            );
        }
    };

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
                id: nuevas?.[index]?.id ?? Date.now() + index,
                candidatoId: c.id,
                codigo: c.codigo,
                nombre: c.nombre,
                correo: c.correo,
                estado: "POSTULADO",
                perfilCalificacion: c.perfilCalificacion,
                habilidadesBlandas: c.habilidadesBlandas,
            }));

            setPostulaciones((prev) => [...prev, ...nuevasFilas]);
            setSeleccionados([]);
            toast.success("Candidatos postulados correctamente");
            onSuccess?.();
        } catch (err) {
            console.error("ERROR POSTULANDO:", err);
            setError(err?.response?.data?.message || "Error al postular candidatos");
        } finally {
            setLoading(false);
        }
    };

    // Filas de la tabla 2 (guardados + nuevos)
    const filasElegidos = [
        ...postulaciones.map((p) => ({ ...p, esNuevo: false })),
        ...seleccionados.map((e) => ({ ...e, estado: "NUEVO", esNuevo: true })),
    ];

    if (!vacante) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col max-h-[94vh]">

                {/* ── Encabezado ─────────────────────────────────────────── */}
                <div className="relative bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
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
                        className="p-1.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Cuerpo ─────────────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col gap-4">

                    {/* Info vacante en una sola fila compacta */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-center text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <Building2 size={16} className="text-slate-400 shrink-0" />
                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400">Empresa</div>
                                <div className="font-semibold text-slate-700 truncate">{vacante.empresa?.nombre}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 min-w-0">
                            <CalendarDays size={16} className="text-slate-400 shrink-0" />
                            <div className="min-w-0">
                                <div className="text-[11px] uppercase tracking-wide text-slate-400">Periodo</div>
                                <div className="font-semibold text-slate-700 truncate">{vacante.periodo?.nombre}</div>
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wide text-slate-400">Perfil y nivel mínimo</div>
                            <div className="flex flex-wrap gap-1 mt-0.5">
                                {vacante.perfiles?.map((perfil) => (
                                    <span
                                        key={perfil.id}
                                        className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 rounded-md"
                                    >
                                        {perfil.nombre} ({perfil.nivel_minimo})
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400">
                                <span className="flex items-center gap-1"><Users size={12} /> Cupos</span>
                                <span className={`font-bold normal-case text-sm ${cuposRestantes === 0 ? "text-red-500" : "text-green-600"}`}>
                                    {cuposOcupados}/{cuposTotal}
                                </span>
                            </div>
                            <div className="h-2 mt-1 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${cuposRestantes === 0 ? "bg-red-500" : "bg-green-500"}`}
                                    style={{ width: `${porcentajeCupos}%` }}
                                />
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                                {cuposRestantes} disponibles
                            </div>
                        </div>

                        {vacante.descripcion && (
                            <div className="md:col-span-4 text-xs text-slate-500 border-t border-gray-100 pt-2 line-clamp-1" title={vacante.descripcion}>
                                <span className="font-semibold text-slate-600">Descripción: </span>
                                {vacante.descripcion}
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
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Perfil</label>
                                    <select
                                        value={perfilSeleccionado}
                                        onChange={(e) => setPerfilSeleccionado(e.target.value)}
                                        className={selectClass}
                                    >
                                        <option value="" disabled>Seleccionar perfil</option>
                                        {perfiles.map((p) => (
                                            <option key={p.id} value={p.id}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Habilidades blandas</label>
                                    <select
                                        value={blandaSeleccionada}
                                        onChange={(e) => setBlandaSeleccionada(e.target.value)}
                                        disabled={!perfilSeleccionado || opcionesBlandas.length === 0}
                                        className={selectClass}
                                    >
                                        <option value="">Todas</option>
                                        {opcionesBlandas.map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={`${ALTO_TABLA} overflow-hidden`}>
                            <GenericTable
                                rows={candidatosFiltrados}
                                currentPage={pageDisponibles}
                                onPageChange={setPageDisponibles}
                                columns={[
                                    { key: "nombre", label: "Candidato", primary: true, render: CeldaNombre },
                                    { key: "perfilCalificacion", label: "Perfil + Calif.", render: CeldaPerfil },
                                    { key: "habilidadesBlandas", label: "Hab. blandas", render: CeldaBlandas },
                                ]}
                                actions={[
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
                                        : !perfilSeleccionado
                                            ? "Selecciona un perfil para ver candidatos"
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

                            <div className={`${ALTO_TABLA} overflow-hidden`}>
                            <GenericTable
                                rows={filasElegidos}
                                currentPage={pageElegidos}
                                onPageChange={setPageElegidos}
                                columns={[
                                    { key: "nombre", label: "Candidato", primary: true, render: CeldaNombre },
                                    { key: "perfilCalificacion", label: "Perfil + Calif.", render: CeldaPerfil },
                                    { key: "habilidadesBlandas", label: "Hab. blandas", render: CeldaBlandas },
                                    {
                                        key: "estado",
                                        label: "Estado",
                                        render: (row) =>
                                            row.esNuevo
                                                ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Nuevo</span>
                                                : <EstadoBadge estado={row.estado} />,
                                    },
                                ]}
                                actions={[
                                    {
                                        icon: <Trash2 size={14} />,
                                        className: "text-gray-400 hover:bg-red-50 hover:text-red-500",
                                        onClick: (id) => {
                                            if (seleccionados.find((e) => e.id === id)) {
                                                quitarSeleccionado(id);
                                            } else {
                                                const p = postulaciones.find((p) => p.id === id);
                                                if (p) handleEliminarPostulacion(p);
                                            }
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
                        <p className="text-xs text-red-500 text-center">{error}</p>
                    )}
                </div>

                {/* ── Pie ────────────────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 px-6 py-3 bg-white border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-xl text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition-all duration-150"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handlePresentar}
                        disabled={seleccionados.length === 0 || loading}
                        className={`
                            px-7 py-2 rounded-xl text-sm font-bold transition-all duration-150
                            ${seleccionados.length > 0 && !loading
                                ? "bg-[#e8192c] hover:bg-[#c8111f] text-white shadow-md shadow-red-200 active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}
                        `}
                    >
                        {loading ? "Guardando…" : `Presentar${seleccionados.length ? ` (${seleccionados.length})` : ""}`}
                    </button>
                </div>
            </div>
        </div>
    );
}