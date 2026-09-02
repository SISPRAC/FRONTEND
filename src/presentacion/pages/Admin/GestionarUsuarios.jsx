import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";

import GenericTable from "../../components/Table/GenericTable";
import UserRolesModal from "../../components/modals/UserRolesModal";
import DeleteModal from "../../components/modals/DeleteModal";

import { SquarePen, Power } from "lucide-react";
import toast from "react-hot-toast";

import { userRepository } from "../../../infraestructura/repository/userRepository.js";
import { getUsers } from "../../../aplicacion/usuario/getUsers";
import { updateUserRoles } from "../../../aplicacion/usuario/cambioDeRol";
import { cambiarEstadoUsuario } from "../../../aplicacion/usuario/cambiarEstado.js"; 

export default function UsersPage() {

    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [search, setSearch] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");

    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [confirmModal, setConfirmModal] = useState(false);
    const [userEstadoSeleccionado, setUserEstadoSeleccionado] = useState(null);


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


    const confirmarCambioEstado = async () => {

        if (!userEstadoSeleccionado) return;

        try {

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

        }

    };


    return (

        <Layout footerLabel="Administrador">

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

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className="
                        w-full
                        sm:w-72
                        px-4
                        py-2
                        border
                        border-slate-300
                        rounded-lg
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-400
                    "
                />


                <select
                    value={filtroEstado}
                    onChange={(e) =>
                        setFiltroEstado(e.target.value)
                    }
                    className="
                        w-full
                        sm:w-48
                        px-4
                        py-2
                        border
                        border-slate-300
                        rounded-lg
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-blue-400
                    "
                >

                    <option value="todos">
                        Todos los estados
                    </option>

                    <option value="ACTIVO">
                        Activos
                    </option>

                    <option value="INACTIVO">
                        Inactivos
                    </option>

                </select>

            </div>


            {/* =========================
                TABLA
            ========================= */}

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
                        render: (row) => (

                            <span
                                className={`
                                    px-3
                                    py-1
                                    rounded-full
                                    text-xs
                                    font-semibold

                                    ${
                                        row.estado === "ACTIVO"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                    }
                                `}
                            >
                                {
                                    row.estado === "ACTIVO"
                                        ? "ACTIVO"
                                        : "INACTIVO"
                                }
                            </span>

                        )
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

            <DeleteModal

                isOpen={confirmModal}

                onClose={() => {
                    setConfirmModal(false);
                    setUserEstadoSeleccionado(null);
                }}

                onConfirm={confirmarCambioEstado}

                title={
                    userEstadoSeleccionado?.estado === "ACTIVO"
                        ? "Inhabilitar usuario"
                        : "Habilitar usuario"
                }

                message={`
                    ¿Desea ${
                        userEstadoSeleccionado?.estado === "ACTIVO"
                            ? "INHABILITAR"
                            : "HABILITAR"
                    } a ${
                        userEstadoSeleccionado
                            ? `${userEstadoSeleccionado.nombres || ""} ${userEstadoSeleccionado.apellidos || ""}`
                            : ""
                    }?
                `}

            />

        </Layout>

    );

}

