import { useEffect, useState } from "react";

import GenericTable from "../../components/Table/GenericTable";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";
import UserRolesModal from "../../components/modals/UserRolesModal";

import { SquarePen, Power, Search, ChevronDown, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { userRepository } from "../../../infraestructura/repository/userRepository.js";
import { getUsers } from "../../../aplicacion/usuario/getUsers";
import { updateUserRoles } from "../../../aplicacion/usuario/cambioDeRol";
import { cambiarEstadoUsuario } from "../../../aplicacion/usuario/cambiarEstado.js";


// ==========================================
// SKELETON
// ==========================================

const UsuariosSkeleton = ({ filas = 6 }) => (
    <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        aria-busy="true"
        aria-label="Cargando usuarios"
    >

        {/* ENCABEZADO */}
        <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
            {[1, 2, 3, 4, 5].map((item) => (
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
                className="grid grid-cols-5 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
            >
                {/* Nombre */}
                <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />

                {/* Correo */}
                <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />

                {/* Roles */}
                <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />

                {/* Estado */}
                <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />

                {/* Acciones */}
                <div className="flex items-center justify-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
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


export default function UsersPage() {

    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");

    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [confirmModal, setConfirmModal] = useState(false);
    const [userEstadoSeleccionado, setUserEstadoSeleccionado] = useState(null);
    const [procesando, setProcesando] = useState(false);


    useEffect(() => {
        loadUsers();
    }, []);


    useEffect(() => {
        aplicarFiltros();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rows, search, filtroEstado]);


    const loadUsers = async () => {

        try {

            const data = await getUsers({
                userRepository
            });

            setRows(data);
            setCurrentPage(1);

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Error al cargar los usuarios"
            );

        } finally {

            setLoading(false);

        }

    };


    const aplicarFiltros = () => {

        let data = [...rows];

        // Filtro por estado
        if (filtroEstado !== "todos") {

            data = data.filter(
                (user) => user.estado === filtroEstado
            );

        }

        // Buscador por nombre, apellido o correo
        if (search.trim() !== "") {

            const term = search.toLowerCase().trim();

            data = data.filter((user) => {

                const nombreCompleto =
                    `${user.nombres || ""} ${user.apellidos || ""}`
                        .toLowerCase();

                const correo =
                    user.correo?.toLowerCase() || "";

                return (
                    nombreCompleto.includes(term) ||
                    correo.includes(term)
                );

            });

        }

        setFilteredRows(data);
        setCurrentPage(1);

    };


    // =========================
    // EDITAR ROLES
    // =========================

    const handleEdit = (id) => {

        const usuario = rows.find(
            (row) => row.id === id
        );

        if (!usuario) return;

        setSelectedUser(usuario);
        setIsOpen(true);

    };


    const handleUpdate = async (roles) => {

        try {

            await updateUserRoles(
                { userRepository },
                selectedUser.id,
                roles
            );

            await loadUsers();

            toast.success("Roles actualizados");

            setIsOpen(false);
            setSelectedUser(null);

        } catch (error) {

            console.error("Error", error);

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar roles"
            );

        }

    };


    // =========================
    // CAMBIAR ESTADO
    // =========================

    const solicitarCambioEstado = (id) => {

        const usuario = rows.find(
            (row) => row.id === id
        );

        if (!usuario) return;

        setUserEstadoSeleccionado(usuario);
        setConfirmModal(true);

    };


    const cerrarModalEstado = () => {

        if (procesando) return;

        setConfirmModal(false);
        setUserEstadoSeleccionado(null);

    };


    const confirmarCambioEstado = async () => {

        if (procesando || !userEstadoSeleccionado) return;

        try {

            setProcesando(true);

            const nuevoEstado =
                userEstadoSeleccionado.estado === "ACTIVO"
                    ? "INACTIVO"
                    : "ACTIVO";


            await cambiarEstadoUsuario(
                { userRepository },
                userEstadoSeleccionado.id,
                nuevoEstado
            );


            await loadUsers();


            toast.success(
                nuevoEstado === "ACTIVO"
                    ? "Usuario habilitado"
                    : "Usuario inhabilitado"
            );


            setConfirmModal(false);
            setUserEstadoSeleccionado(null);

        } catch (error) {

            console.error("Error al cambiar estado:", error);

            toast.error(
                error.response?.data?.message ||
                "Error al cambiar el estado del usuario"
            );

        } finally {

            setProcesando(false);

        }

    };


    const estaActivo = userEstadoSeleccionado?.estado === "ACTIVO";

    const nombreSeleccionado = userEstadoSeleccionado
        ? `${userEstadoSeleccionado.nombres || ""} ${userEstadoSeleccionado.apellidos || ""}`.trim()
        : "";


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
                Usuarios
            </h1>


            {/* =========================
                FILTROS
            ========================= */}

            <div
                className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                    mb-5
                    sm:items-center
                    sm:justify-between
                "
            >

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


            {/* =========================
                SKELETON / TABLA
            ========================= */}

            {loading ? (

                <UsuariosSkeleton />

            ) : (

                <GenericTable

                    rows={filteredRows}

                    currentPage={currentPage}

                    onPageChange={setCurrentPage}

                    columns={[

                        {
                            key: "nombres",
                            label: "Nombre",
                            primary: true,
                            render: (row) =>
                                `${row.nombres || ""} ${row.apellidos || ""}`
                        },

                        {
                            key: "correo",
                            label: "Correo"
                        },

                        {
                            key: "roles",
                            label: "Roles",
                            render: (row) =>
                                row.Roles
                                    ?.map((rol) => rol.nombre)
                                    .join(", ") || "Sin roles"
                        },

                        {
                            key: "estado",
                            label: "Estado",
                            render: (row) => <EstadoBadge estado={row.estado} />
                        }

                    ]}


                    actions={[

                        {
                            icon: <SquarePen size={24} />,
                            className: "hover:bg-blue-100",
                            onClick: handleEdit
                        },

                        {
                            icon: <Power size={22} />,
                            className: "hover:bg-amber-100",
                            onClick: solicitarCambioEstado
                        }

                    ]}


                    emptyMessage="No hay usuarios registrados."

                    pageSize={6}

                />

            )}


            {/* =========================
                MODAL ROLES
            ========================= */}

            <UserRolesModal

                isOpen={isOpen}

                onClose={() => {
                    setIsOpen(false);
                    setSelectedUser(null);
                }}

                onSubmit={handleUpdate}

                user={selectedUser}

            />


            {/* =========================
                MODAL ESTADO
            ========================= */}

            <ConfirmarEstadoModal

                isOpen={confirmModal}

                onClose={cerrarModalEstado}

                onConfirm={confirmarCambioEstado}

                loading={procesando}

                title={estaActivo ? "Inhabilitar usuario" : "Habilitar usuario"}

                message={`¿Desea ${estaActivo ? "INHABILITAR" : "HABILITAR"} a ${nombreSeleccionado}?`}

            />

        </div>

    );

}