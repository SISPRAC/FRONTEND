import { useEffect, useState } from "react";

import GenericTable from "../components/Table/GenericTable";
import EstadoBadge from "../components/estadoBadge/EstadoBadge.jsx";
import InviteModal from "../components/modals/InviteModal";
import { Power, Search, ChevronDown, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";


// ==========================================
// SKELETON
// ==========================================

const TutoresSkeleton = ({ filas = 6 }) => (
    <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        aria-busy="true"
        aria-label="Cargando tutores"
    >

        {/* ENCABEZADO */}
        <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="h-3 w-20 rounded bg-slate-200 animate-pulse"
                />
            ))}
        </div>

        {/* FILAS */}
        {Array.from({ length: filas }).map((_, fila) => (
            <div
                key={fila}
                className="grid grid-cols-4 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
            >
                {/* Nombre */}
                <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />

                {/* Correo */}
                <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />

                {/* Estado */}
                <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />

                {/* Acciones */}
                <div className="flex justify-center">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                </div>
            </div>
        ))}

    </div>
);


// ==========================================
// MODAL CONFIRMAR CAMBIO DE ESTADO
// ==========================================

const ConfirmarEstadoModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    loading = false,
}) => {

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            onClick={onClose}
        >

            <div
                className="w-full max-w-md rounded-xl bg-white shadow-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >

                <h2 className="text-xl font-bold text-slate-800 mb-3">
                    {title}
                </h2>

                <p className="text-sm text-slate-600 leading-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3 mt-6">

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="
                            px-4 py-2
                            rounded-lg
                            border border-slate-200
                            text-sm font-semibold text-slate-600
                            hover:bg-slate-50
                            transition
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                        "
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="
                            inline-flex items-center justify-center gap-2
                            min-w-[130px]
                            px-4 py-2
                            rounded-lg
                            bg-[#e8192c] hover:bg-[#c8111f]
                            text-white text-sm font-semibold
                            transition
                            disabled:opacity-60
                            disabled:cursor-not-allowed
                        "
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Confirmando...
                            </>
                        ) : (
                            "Confirmar"
                        )}
                    </button>

                </div>

            </div>

        </div>
    );
};


export default function GestionTutores({
    titulo = "Tutores",
    footerLabel = "Director",
    casosDeUso, // { getTutores, inviteTutor, toggleEstadoTutor }
}) {
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); // todos | ACTIVO | INACTIVO

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [tutorSeleccionado, setTutorSeleccionado] = useState(null);
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        loadTutores();
    }, []);

    useEffect(() => {
        aplicarFiltros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, search, filtroEstado]);

    const loadTutores = async () => {
        try {
            const data = await casosDeUso.getTutores();
            setRows(data);
            setCurrentPage(1);
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Error al cargar los tutores"
            );
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let data = [...rows];

        if (filtroEstado !== "todos") {
            data = data.filter((r) => r.estado === filtroEstado);
        }

        if (search.trim() !== "") {
            const term = search.toLowerCase().trim();
            data = data.filter(
                (r) =>
                    r.nombre?.toLowerCase().includes(term) ||
                    r.correo?.toLowerCase().includes(term)
            );
        }

        setFilteredRows(data);
        setCurrentPage(1);
    };

    const handleInvitar = () => {
        setIsInviteOpen(true);
    };

    const handleEnviarInvitacion = async (correo) => {
        try {
            await casosDeUso.inviteTutor(correo);
            await loadTutores();
            toast.success("Invitación enviada con éxito");
            setIsInviteOpen(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Error al enviar la invitación"
            );
        }
    };

    const solicitarCambioEstado = (id) => {
        const tutor = rows.find((r) => r.id === id);

        if (!tutor) return;

        setTutorSeleccionado(tutor);
        setConfirmModal(true);
    };

    const cerrarModalEstado = () => {
        if (procesando) return;

        setConfirmModal(false);
        setTutorSeleccionado(null);
    };

    const confirmarCambioEstado = async () => {
        if (procesando || !tutorSeleccionado) return;

        try {
            setProcesando(true);

            const nuevoEstado =
                tutorSeleccionado.estado === "ACTIVO"
                    ? "INACTIVO"
                    : "ACTIVO";

            await casosDeUso.toggleEstadoTutor(
                tutorSeleccionado.id_usuario,
                nuevoEstado
            );

            await loadTutores();

            toast.success(
                nuevoEstado === "ACTIVO"
                    ? "Tutor habilitado"
                    : "Tutor inhabilitado"
            );

            setConfirmModal(false);
            setTutorSeleccionado(null);

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Error al cambiar el estado del tutor"
            );
        } finally {
            setProcesando(false);
        }
    };

    const estaActivo = tutorSeleccionado?.estado === "ACTIVO";

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
                {titulo}
            </h1>

            {/* Filtros: búsqueda + estado */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:items-center sm:justify-between">

                {/* BUSCADOR */}
                <div className="relative w-full sm:w-80">

                    <Search
                        size={16}
                        className="
                            pointer-events-none
                            absolute left-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
                        className="
                            w-full
                            h-10
                            pl-10 pr-9
                            rounded-xl
                            border border-slate-200
                            bg-white
                            text-sm text-slate-700
                            placeholder:text-slate-400
                            shadow-sm
                            transition
                            hover:border-slate-300
                            focus:outline-none
                            focus:border-blue-400
                            focus:ring-4 focus:ring-blue-100
                        "
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            aria-label="Limpiar búsqueda"
                            className="
                                absolute right-2.5 top-1/2
                                -translate-y-1/2
                                p-1 rounded-full
                                text-slate-400
                                hover:text-slate-600 hover:bg-slate-100
                                transition
                            "
                        >
                            <X size={14} />
                        </button>
                    )}

                </div>

                {/* SELECT ESTADO */}
                <div className="relative w-full sm:w-52">

                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="
                            appearance-none
                            w-full
                            h-10
                            pl-4 pr-10
                            rounded-xl
                            border border-slate-200
                            bg-white
                            text-sm font-medium text-slate-700
                            shadow-sm
                            cursor-pointer
                            transition
                            hover:border-slate-300
                            focus:outline-none
                            focus:border-blue-400
                            focus:ring-4 focus:ring-blue-100
                        "
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="ACTIVO">Activos</option>
                        <option value="INACTIVO">Inactivos</option>
                    </select>

                    <ChevronDown
                        size={16}
                        className="
                            pointer-events-none
                            absolute right-3.5 top-1/2
                            -translate-y-1/2
                            text-slate-400
                        "
                    />

                </div>

            </div>

            {/* SKELETON / TABLA */}
            {loading ? (
                <TutoresSkeleton />
            ) : (
                <GenericTable
                    rows={filteredRows}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    columns={[
                        {
                            key: "nombre",
                            label: "Nombre",
                            primary: true,
                        },
                        {
                            key: "correo",
                            label: "Correo",
                        },
                        {
                            key: "estado",
                            label: "Estado",
                            render: (row) => <EstadoBadge estado={row.estado} />,
                        },
                    ]}
                    actions={[
                        {
                            icon: <Power size={22} />,
                            className: "hover:bg-amber-100",
                            onClick: solicitarCambioEstado,
                        },
                    ]}
                    emptyMessage="No hay tutores registrados."
                    pageSize={6}
                />
            )}

            <div className="flex justify-end mt-8">
                <button
                    onClick={handleInvitar}
                    className="
                        px-6 py-2.5
                        bg-[#e8192c] hover:bg-[#c8111f]
                        text-white font-semibold
                        rounded-xl
                        shadow-sm
                        transition
                    "
                >
                    Invitar
                </button>
            </div>

            <InviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                onSubmit={handleEnviarInvitacion}
            />

            <ConfirmarEstadoModal
                isOpen={confirmModal}
                onClose={cerrarModalEstado}
                onConfirm={confirmarCambioEstado}
                loading={procesando}
                title={estaActivo ? "Inhabilitar tutor" : "Habilitar tutor"}
                message={`¿Desea ${estaActivo ? "INHABILITAR" : "HABILITAR"} a ${tutorSeleccionado?.nombre}?`}
            />
        </div>
    );
}