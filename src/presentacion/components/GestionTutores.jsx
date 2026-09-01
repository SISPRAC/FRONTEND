import { useEffect, useState } from "react";
import Layout from "../shared/Layouts/Layout";

import GenericTable from "../components/Table/GenericTable";
import DeleteModal from "../components/modals/DeleteModal"; // reutilizado como modal de confirmación genérico
import InviteModal from "../components/modals/InviteModal";
import { Power } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Componente genérico para la gestión de tutores (Docente / Empresarial).
 *
 * Se le pasa por props "casosDeUso": un objeto con las funciones reales
 * que hablan con el backend (getTutores, inviteTutor, toggleEstadoTutor).
 * Así el mismo componente sirve para Tutor Docente y Tutor Empresarial
 * sin duplicar código ni saber nada de roles.
 *
 * Este componente NO decide qué rol usa qué casos de uso — eso lo
 * resuelve GestionTutoresPage.jsx, que lee el rol activo del usuario
 * y le inyecta el "casosDeUso" correcto.
 */
export default function GestionTutores({
    titulo = "Tutores",
    footerLabel = "Director",
    casosDeUso, // { getTutores, inviteTutor, toggleEstadoTutor }
}) {
    const [rows, setRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [search, setSearch] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); // todos | activo | inactivo

    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [tutorSeleccionado, setTutorSeleccionado] = useState(null);

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
            console.log("Datos de tutores", data);
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Error al cargar los tutores"
            );
        }
    };

    const aplicarFiltros = () => {
        let data = [...rows];

        if (filtroEstado !== "todos") {
            data = data.filter((r) => r.estado === filtroEstado);
        }

        if (search.trim() !== "") {
            const term = search.toLowerCase();
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

    const confirmarCambioEstado = async () => {
        try {
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
        }
    };

    return (
        <Layout footerLabel={footerLabel}>
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
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className="
            w-full sm:w-72
            px-4 py-2
            border border-slate-300
            rounded-lg
            text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
                />

                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="
            w-full sm:w-48
            px-4 py-2
            border border-slate-300
            rounded-lg
            text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
                >
                    <option value="todos">Todos los estados</option>
                    <option value="ACTIVO">Activos</option>
                    <option value="INACTIVO">Inactivos</option>
                </select>
            </div>

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
                        render: (row) => (
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${row.estado === "ACTIVO"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {row.estado === "ACTIVO" ? "ACTIVO" : "INACTIVO"}
                            </span>
                        ),
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

            <div className="flex justify-end mt-8">
                <button
                    onClick={handleInvitar}
                    className="
            px-6 py-2.5
           bg-[#e8192c] hover:bg-[#c8111f]
            text-white font-semibold
            rounded-lg
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

            <DeleteModal
                isOpen={confirmModal}
                onClose={() => {
                    setConfirmModal(false);
                    setTutorSeleccionado(null);
                }}
                onConfirm={confirmarCambioEstado}
                title={
                    tutorSeleccionado?.estado === "ACTIVO"
                        ? "Inhabilitar tutor"
                        : "Habilitar tutor"
                }
                message={`¿Desea ${tutorSeleccionado?.estado === "ACTIVO" ? "INHABLITAR" : "HABILITAR"
                    } a ${tutorSeleccionado?.nombre}?`}
            />
        </Layout>
    );
}