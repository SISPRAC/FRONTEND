
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    Trash2,
    SquarePen,
    Search,
    FileText
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";
import AddButton from "../../components/buttons/Addbutton.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal";
import TipoRequisitoDocumentoModal from "../../components/modals/TipoRequisitoDocumentoModal.jsx";

import { tipoRequisitoDocumentoRepository } from "../../../infraestructura/repository/tipoRequisitoDocumentoRepository.js";

import { crearTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/crearTipoRequisitoDocumento.js";
import { obtenerTiposRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTiposRequisitoDocumento.js";
import { obtenerTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTipoRequisitoDocumento.js";
import { actualizarTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/actualizarTipoRequisitoDocumento.js";
import { eliminarTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/eliminarTipoRequisitoDocumento.js";

const ROL_PRACTICANTE_ID = 4;

// Normalizar textos para las búsquedas y validaciones.
const normalizar = (texto = "") =>
    texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

// Skeleton de la tabla.
function TableSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {["Documento", "Descripción", "Obligatorio", "Plantilla", "Estado", "Acciones"].map(
                                (columna) => (
                                    <th
                                        key={columna}
                                        className="px-5 py-4 text-left"
                                    >
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <tr
                                key={index}
                                className="border-b border-gray-100 last:border-0"
                            >
                                <td className="px-5 py-5">
                                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-4 w-44 bg-gray-100 rounded animate-pulse" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-6 w-12 bg-gray-100 rounded-full animate-pulse" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
                                </td>

                                <td className="px-5 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex justify-between items-center">
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-2">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-8 w-8 bg-gray-100 rounded-lg animate-pulse" />
                </div>
            </div>
        </div>
    );
}

export default function TipoRequisitoDocumentoPage() {
    const [rows, setRows] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [cargando, setCargando] = useState(true);
    const [editandoId, setEditandoId] = useState(null);

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedRequisito, setSelectedRequisito] = useState(null);

    const [deleteModal, setDeleteModal] = useState(false);
    const [requisitoToDelete, setRequisitoToDelete] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    useEffect(() => {
        loadRequisitos(true);
    }, []);

    // Obtener requisitos documentales.
    const loadRequisitos = async (mostrarSkeleton = false) => {
        try {
            if (mostrarSkeleton) setCargando(true);

            const data = await obtenerTiposRequisitoDocumento({
                tipoRequisitoDocumentoRepository,
            });

            setRows(Array.isArray(data) ? data : data?.data || []);
            return true;
        } catch (error) {
            console.error(error);

            toast.error(
                "No fue posible cargar los requisitos documentales."
            );

            return false;
        } finally {
            if (mostrarSkeleton) setCargando(false);
        }
    };

    // Filtrar únicamente los requisitos de practicantes.
    const rowsPracticante = useMemo(
        () =>
            rows.filter(
                (row) => Number(row.rol_id) === ROL_PRACTICANTE_ID
            ),
        [rows]
    );

    // Filtrar por nombre o descripción.
    const rowsFiltradas = useMemo(() => {
        const termino = normalizar(busqueda);

        if (!termino) return rowsPracticante;

        return rowsPracticante.filter((row) =>
            normalizar(`${row.nombre || ""} ${row.descripcion || ""}`).includes(termino)
        );
    }, [rowsPracticante, busqueda]);

    // Validar nombres repetidos.
    const nombreRepetido = (nombre, idActual = null) =>
        rowsPracticante.some(
            (row) =>
                Number(row.id) !== Number(idActual) &&
                normalizar(row.nombre || "") === normalizar(nombre || "")
        );

    // Construir FormData.
    const buildFormData = (formData) => {
        const data = new FormData();

        data.append("nombre", formData.nombre);
        data.append("descripcion", formData.descripcion);
        data.append("rol_id", ROL_PRACTICANTE_ID);
        data.append("obligatorio", formData.obligatorio);
        data.append("estado", formData.estado);

        if (formData.archivo) {
            data.append("archivo", formData.archivo);
        }

        return data;
    };

    // Abrir creación.
    const handleCreate = () => {
        setSelectedRequisito(null);
        setMode("create");
        setIsOpen(true);
    };

    // Abrir edición.
    const handleEdit = async (id) => {
        if (editandoId) return;

        try {
            setEditandoId(id);

            const data = await obtenerTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                id
            );

            const requisito = data?.data || data;

            if (!requisito) {
                toast.error("No se encontró el requisito.");
                return;
            }

            setSelectedRequisito(requisito);
            setMode("edit");
            setIsOpen(true);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Error al cargar el requisito."
            );
        } finally {
            setEditandoId(null);
        }
    };

    // Crear requisito.
    const handleSave = async (formData) => {
        if (nombreRepetido(formData.nombre)) {
            toast.error("Ya existe un documento con ese nombre.");
            return;
        }

        try {
            await crearTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                buildFormData(formData)
            );

            await loadRequisitos();

            toast.success("Requisito creado.");
            setIsOpen(false);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Error al crear el requisito."
            );
        }
    };

    // Actualizar requisito.
    const handleUpdate = async (formData) => {
        if (nombreRepetido(formData.nombre, formData.id)) {
            toast.error("Ya existe un documento con ese nombre.");
            return;
        }

        try {
            await actualizarTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                formData.id,
                buildFormData(formData)
            );

            await loadRequisitos();

            toast.success("Requisito actualizado.");
            setIsOpen(false);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar el requisito."
            );
        }
    };

    // Abrir confirmación de eliminación.
    const deleteRow = (id) => {
        const requisito = rows.find(
            (row) => Number(row.id) === Number(id)
        );

        if (!requisito) return;

        setRequisitoToDelete(requisito);
        setDeleteModal(true);
    };

    // Cerrar confirmación.
    const cerrarDelete = () => {
        if (eliminando) return;

        setDeleteModal(false);
        setRequisitoToDelete(null);
    };

    // Eliminar requisito.
    const handleDelete = async () => {
        if (!requisitoToDelete || eliminando) return;

        try {
            setEliminando(true);

            await eliminarTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                requisitoToDelete.id
            );

            await loadRequisitos();

            toast.success("Requisito eliminado.");

            setDeleteModal(false);
            setRequisitoToDelete(null);
        } catch (error) {
            console.error(error);

            toast.error(
                error.response?.data?.message ||
                "Error al eliminar."
            );
        } finally {
            setEliminando(false);
        }
    };

    return (
        <div className="w-full space-y-6">

            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Documentos de practicantes
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Gestiona los documentos requeridos para los practicantes.
                    </p>
                </div>

                {!cargando && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText size={17} />
                        <span>
                            {rowsPracticante.length} documentos registrados
                        </span>
                    </div>
                )}
            </div>

            {/* Búsqueda */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
                <label
                    htmlFor="buscar-documento"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                >
                    Buscar documento
                </label>

                <div className="relative max-w-xl">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        id="buscar-documento"
                        type="text"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Buscar por nombre o descripción..."
                        className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    />
                </div>
            </div>

            {/* Tabla o Skeleton */}
            {cargando ? (
                <TableSkeleton />
            ) : (
                <GenericTable
                    rows={rowsFiltradas}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pageSize={8}
                    emptyMessage={
                        busqueda
                            ? "No se encontraron documentos con ese nombre."
                            : "No hay requisitos documentales registrados para practicantes."
                    }
                    columns={[
                        {
                            key: "nombre",
                            label: "Documento",
                            primary: true,
                        },
                        {
                            key: "descripcion",
                            label: "Descripción",
                            render: (row) =>
                                row.descripcion || "Sin descripción",
                        },
                        {
                            key: "obligatorio",
                            label: "Obligatorio",
                            render: (row) =>
                                row.obligatorio ? "Sí" : "No",
                        },
                        {
                            key: "plantilla",
                            label: "Plantilla",
                            render: (row) =>
                                row.plantilla
                                    ? "Disponible"
                                    : "Sin plantilla",
                        },
                        {
                            key: "estado",
                            label: "Estado",
                            render: (row) =>
                                row.estado ? "Activo" : "Inactivo",
                        },
                    ]}
                    actions={[
                        {
                            icon: <SquarePen size={19} />,
                            className: "hover:bg-blue-100 hover:text-blue-600 transition-colors",
                            onClick: handleEdit,
                        },
                        {
                            icon: <Trash2 size={19} />,
                            className: "hover:bg-red-100 hover:text-red-600 transition-colors",
                            onClick: deleteRow,
                        },
                    ]}
                />
            )}

            {/* Botón agregar */}
            <AddButton onClick={handleCreate} />

            {/* Modal crear / editar */}
            <TipoRequisitoDocumentoModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={mode === "edit" ? handleUpdate : handleSave}
                requisito={selectedRequisito}
                requisitos={rowsPracticante}
                mode={mode}
            />

            {/* Confirmar eliminación */}
            <ConfirmModal
                isOpen={deleteModal}
                title="Eliminar requisito documental"
                message={`¿Desea eliminar el documento "${requisitoToDelete?.nombre}"?`}
                confirmLabel="Eliminar"
                loading={eliminando}
                onConfirm={handleDelete}
                onCancel={cerrarDelete}
            />
        </div>
    );
}
