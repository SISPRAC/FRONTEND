import { useEffect, useState } from "react";
import { X, Trash2 } from "lucide-react";
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

export default function PostularCandidatoModal({ vacante, onClose, onSuccess }) {
    // ── Selects encadenados ───────────────────────────────────────────────────
    const [perfiles, setPerfiles] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [perfilSeleccionado, setPerfilSeleccionado] = useState("");
    const [candidatosDisponibles, setCandidatosDisponibles] = useState([]);
    const [loadingCandidatos, setLoadingCandidatos] = useState(false);
    const [candidatoSeleccionado, setcandidatoSeleccionado] = useState("");

    // ── Postulaciones existentes en BD ────────────────────────────────────────
    const [postulaciones, setPostulaciones] = useState([]);

    // ── Nuevos seleccionados en esta sesión (pendiente de guardar) ────────────
    const [seleccionados, setSeleccionados] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cuposTotal =
        vacante?.AperturaVacantes?.[0]?.cupos ??
        vacante?.cuposDisponibles ??
        0;
    const cuposOcupados =
        postulaciones.filter(
            p =>
                p.estado === "POSTULADO" ||
                p.estado === "ACEPTADO"
        ).length +
        seleccionados.length;
    const cuposRestantes = Math.max(0, cuposTotal - cuposOcupados);
    const puedeAgregar = cuposRestantes > 0;

    // ── Carga perfiles al montar ──────────────────────────────────────────────
    useEffect(() => {
        cargarPerfiles();

        const candidatosPostulados =
            vacante?.AperturaVacantes?.flatMap(apertura =>
                apertura.candidatos?.map(item => {

                    const perfilVacanteId = vacante.perfiles?.[0]?.id;

                    const perfilCandidato =
                        item.candidato.perfiles?.find(
                            p => p.id === perfilVacanteId
                        );

                    return {
                        id: item.idPostulacion,
                        candidatoId: item.candidato.id,
                        codigo: item.candidato.codigo,
                        nombre: item.candidato.nombres,
                        correo: item.candidato.correo,
                        estado: item.estadoPostulacion,
                        calificacion: perfilCandidato?.calificacion ?? "-"
                    };
                }) || []
            ) || [];

        setPostulaciones(candidatosPostulados);

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

    // ── Carga candidatos cuando cambia el perfil seleccionado ───────────────
    useEffect(() => {
        if (!perfilSeleccionado) {
            setCandidatosDisponibles([]);
            setcandidatoSeleccionado("");
            return;
        }

        cargarCandidatos(perfilSeleccionado);
    }, [perfilSeleccionado]);

    const cargarCandidatos = async (perfilId) => {
        setLoadingCandidatos(true);
        setError(null);

        try {
            const perfil = perfiles.find(
                (p) => p.id === Number(perfilId)
            );

            const data = await getCandidatosPerfil(
                { candidatoRepository },
                perfil.nombre
            );

            setCandidatosDisponibles(data.data);
        } catch (err) {
            console.error(err);
            setError("Error cargando candidatos");
        } finally {
            setLoadingCandidatos(false);
        }
    };

    // IDs ya ocupados (BD + sesión actual)
    const idsOcupados = new Set([
        ...postulaciones
            .filter(
                p =>
                    p.estado === "POSTULADO" ||
                    p.estado === "ACEPTADO"
            )
            .map((p) => p.candidatoId),
        ...seleccionados.map((e) => e.id),
    ]);

    const candidatosFiltrados = candidatosDisponibles.filter((c) => !idsOcupados.has(c.id)).sort((a, b) => b.calificacion - a.calificacion);

    // ── Agregar candidato desde el select ────────────────────────────────────
    const handleAgregarcandidato = (e) => {
        const id = Number(e.target.value);
        if (!id || !puedeAgregar) return;
        const candidato = candidatosFiltrados.find((c) => c.id === id);
        if (!candidato) return;
        setSeleccionados((prev) => [...prev, candidato]);
        setcandidatoSeleccionado("");
    };

    // ── Quitar de la lista nueva (no guardado) ────────────────────────────────
    const quitarSeleccionado = (id) => {
        setSeleccionados((prev) => prev.filter((e) => e.id !== id));
    };

    // ── Eliminar postulación existente en BD ──────────────────────────────────
    const handleEliminarPostulacion = async (
        postulacion
    ) => {

        if (
            !ESTADOS_ELIMINABLES.includes(
                postulacion.estado
            )
        ) {
            return;
        }

        try {

            const aperturaVacanteId =
                vacante?.AperturaVacantes?.[0]?.id;

            await eliminarPostulacion(
                postulacionRepository,
                aperturaVacanteId,
                postulacion.candidatoId
            );

            setPostulaciones((prev) =>
                prev.filter(
                    (p) => p.id !== postulacion.id
                )
            );

            toast.success(
                "Postulación eliminada correctamente"
            );

            onSuccess?.();

        } catch (err) {

            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                "Error eliminando postulación"
            );
        }
    };

    // ── Guardar postulaciones nuevas ──────────────────────────────────────────
    const handlePresentar = async () => {

        if (seleccionados.length === 0) return;

        setLoading(true);
        setError(null);

        try {

            const aperturaVacanteId =
                vacante?.AperturaVacantes?.[0]?.id;

            const candidatosIds =
                seleccionados.map((e) => e.id);

            await registrarPostulacion(
                { postulacionRepository },
                aperturaVacanteId,
                candidatosIds
            );

            toast.success("Candidatos postulados correctamente");

            onSuccess?.();

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Error al postular candidatos"
            );

        } finally {
            setLoading(false);
        }
    };


    // Filas combinadas para la tabla
    const filas = [
        ...postulaciones.map((p) => ({
            ...p,
            esNuevo: false,
        })),
        ...seleccionados.map((e) => ({ ...e, estado: "NUEVO", esNuevo: true })),
    ];

    if (!vacante) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Encabezado */}
                <div className="relative flex items-center justify-center px-6 pt-5 pb-3">
                    <h2 className="text-2xl font-extrabold text-slate-800">
                        Presentar Candidato
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 text-slate-400 hover:text-red-500 transition-colors pb-6"
                    >
                        ✕
                    </button>
                </div>

                <div className="px-6 overflow-y-auto flex-1 pb-4 flex flex-col gap-4">

                    {/* Info vacante */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div>
                            <span className="font-semibold text-gray-700">Empresa: </span>
                            <span className="text-gray-600">{vacante.empresa?.nombre}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Periodo: </span>
                            <span className="text-gray-600">{vacante.periodo?.nombre}</span>
                        </div>
                        <div >
                            <span className="font-semibold text-gray-700">Descripción: </span>
                            <span className="text-gray-600">{vacante.descripcion}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-700">Perfil y nivel minimo: </span>

                            <div className="flex flex-wrap gap-2 mt-1">
                                {vacante.perfiles?.map((perfil) => (
                                    <span
                                        key={perfil.id}
                                        className="px-2 py-1 text-xs bg-slate-100 rounded-md"
                                    >
                                        {perfil.nombre} ({perfil.nivel_minimo})
                                    </span>
                                ))}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">
                                    Cupos ocupados:
                                </span>

                                <span
                                    className={`ml-1 font-bold ${cuposRestantes === 0
                                        ? "text-red-500"
                                        : "text-green-600"
                                        }`}
                                >
                                    {cuposOcupados}/{cuposTotal}
                                </span>

                                <span className="ml-2 text-xs text-gray-500">
                                    ({cuposRestantes} disponibles)
                                </span>
                            </div>
                        </div>


                    </div>

                    {/* Selects encadenados */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Select perfil */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Perfil</label>
                            <select
                                value={perfilSeleccionado}
                                onChange={(e) => setPerfilSeleccionado(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#e8192c] focus:border-[#e8192c] transition-all cursor-pointer"
                            >
                                <option value="" disabled>Seleccionar perfil</option>
                                {perfiles.map((p) => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Select Candiato (depende del perfil) */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-gray-500">Candidato</label>
                            <select
                                value={candidatoSeleccionado}
                                disabled={!perfilSeleccionado || !puedeAgregar || loadingCandidatos}
                                onChange={handleAgregarcandidato}
                                className={`
                  border rounded-lg px-3 py-1.5 text-sm bg-white transition-all
                  ${perfilSeleccionado && puedeAgregar && !loadingCandidatos
                                        ? "border-gray-200 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8192c] focus:border-[#e8192c] cursor-pointer"
                                        : "border-gray-100 text-gray-400 cursor-not-allowed bg-gray-50"}
                `}
                            >
                                <option value="" disabled>
                                    {loadingCandidatos
                                        ? "Cargando…"
                                        : !perfilSeleccionado
                                            ? "Primero elige un perfil"
                                            : !puedeAgregar
                                                ? "Cupos llenos"
                                                : candidatosFiltrados.length === 0
                                                    ? "Sin candidatos disponibles"
                                                    : "Agregar candidato"}
                                </option>
                                {candidatosFiltrados.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.nombre} - {c.calificacion}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tabla */}
                    <GenericTable
                            rows={filas}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        columns={[
                            { key: "codigo", label: "Código" },
                            { key: "nombre", label: "Nombre", primary: true },
                            { key: "calificacion", label: "Calificacion", primary: true },
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
                                    // ¿Es un seleccionado nuevo o una postulación existente?
                                    if (seleccionados.find((e) => e.id === id)) {
                                        quitarSeleccionado(id);
                                    } else {
                                        const p = postulaciones.find((p) => p.id === id);
                                        if (p) handleEliminarPostulacion(p);
                                    }
                                },
                            },
                        ]}
                        emptyMessage="Agrega Candidatos para postular"
                        pageSize={3}
                    />

                    {error && (
                        <p className="text-xs text-red-500 text-center">{error}</p>
                    )}
                </div>

                {/* Pie */}
                <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={handlePresentar}
                        disabled={seleccionados.length === 0 || loading}
                        className={`
              px-7 py-2 rounded-xl text-sm font-bold transition-all duration-150
              ${seleccionados.length > 0 && !loading
                                ? "bg-[#e8192c] hover:bg-[#c8111f] text-white active:scale-95"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}
            `}
                    >
                        {loading ? "Guardando…" : "Presentar"}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-7 py-2 rounded-xl text-sm font-bold bg-slate-200 hover:bg-slate-300 text-slate-700 active:scale-95 transition-all duration-150"
                    >
                        Cancelar
                    </button>
                </div>

            </div>
        </div>
    );
}
