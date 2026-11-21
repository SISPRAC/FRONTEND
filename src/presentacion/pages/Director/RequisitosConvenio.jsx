
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash, SquarePen, FileText, Search } from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";
import AddButton from "../../components/buttons/Addbutton.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal";
import RequisitoConvenioModal from "../../components/modals/RequisitoConvenioModal.jsx";

import { rolRepository } from "../../../infraestructura/repository/rolRepository.js";
import { tipoRequisitoDocumentoRepository } from "../../../infraestructura/repository/tipoRequisitoDocumentoRepository.js";

import { getRoles } from "../../../aplicacion/rol/getRoles.js";

import { crearTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/crearTipoRequisitoDocumento.js";
import { obtenerTiposRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTiposRequisitoDocumento.js";
import { obtenerTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTipoRequisitoDocumento.js";
import { actualizarTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/actualizarTipoRequisitoDocumento.js";
import { eliminarTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/eliminarTipoRequisitoDocumento.js";

const etiquetaTipoEmpresa = (tipo) =>
    tipo === "publica"
        ? "Pública"
        : tipo === "privada"
            ? "Privada"
            : "Ambas";

export default function RequisitosConvenio() {
    const [roles, setRoles] = useState([]);
    const [tipoEmpresaFiltro, setTipoEmpresaFiltro] = useState("");

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedRequisito, setSelectedRequisito] = useState(null);

    // Modal de confirmación.
    const [deleteModal, setDeleteModal] = useState(false);
    const [requisitoToDelete, setRequisitoToDelete] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    // Rol empresa.
    const rolEmpresa = useMemo(
        () => roles.find(r =>
            r.nombre?.toLowerCase().includes("empresa")
        ),
        [roles]
    );

    // Cargar información inicial.
    useEffect(() => {
        const inicializar = async () => {
            await Promise.all([
                loadRoles(),
                loadRequisitos()
            ]);
        };

        inicializar();
    }, []);

    // Obtener roles.
    const loadRoles = async () => {
        try {
            const data = await getRoles(rolRepository);
            setRoles(data.roles || []);
        } catch (error) {
            console.error("Error al cargar roles:", error);
            toast.error("Error al cargar los roles.");
        }
    };

    // Obtener requisitos.
    const loadRequisitos = async (mostrarLoading = true) => {
        if (mostrarLoading) setLoading(true);

        try {
            const data = await obtenerTiposRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                { es_requisito_convenio: true }
            );

            setRows(data || []);
            setCurrentPage(1);

            return true;
        } catch (error) {
            console.error("Error al cargar requisitos:", error);

            toast.error(
                error.response?.data?.message ||
                "Error al cargar los requisitos del convenio."
            );

            return false;
        } finally {
            if (mostrarLoading) setLoading(false);
        }
    };

    // Filtrar requisitos.
    const rowsFiltradas = useMemo(() => {
        if (!tipoEmpresaFiltro) return rows;

        return rows.filter(
            row =>
                !row.tipo_empresa ||
                row.tipo_empresa === tipoEmpresaFiltro
        );
    }, [rows, tipoEmpresaFiltro]);

    // Construir FormData.
    const buildFormData = (formData) => {
        const data = new FormData();

        data.append("nombre", formData.nombre);
        data.append("descripcion", formData.descripcion || "");
        data.append("rol_id", rolEmpresa.id);
        data.append("obligatorio", formData.obligatorio);
        data.append("estado", formData.estado);
        data.append("es_requisito_convenio", true);
        data.append("tipo_empresa", formData.tipo_empresa || "");

        if (formData.archivo) {
            data.append("archivo", formData.archivo);
        }

        return data;
    };

    // Crear.
    const handleCreate = () => {
        if (!rolEmpresa) {
            toast.error("No se encontró el rol de empresa.");
            return;
        }

        setSelectedRequisito(null);
        setMode("create");
        setIsOpen(true);
    };

    // Editar.
    const handleEdit = async (id) => {
        try {
            const requisito = await obtenerTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                id
            );

            if (!requisito) {
                toast.error("No se encontró el requisito.");
                return;
            }

            setSelectedRequisito(requisito);
            setMode("edit");
            setIsOpen(true);
        } catch (error) {
            console.error("Error al obtener requisito:", error);

            toast.error(
                error.response?.data?.message ||
                "Error al cargar el requisito."
            );
        }
    };

    // Guardar.
    const handleSave = async (formData) => {
        if (!rolEmpresa) {
            toast.error("No se encontró el rol de empresa.");
            return;
        }

        try {
            await crearTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                buildFormData(formData)
            );

            await loadRequisitos(false);

            toast.success("Requisito creado.");
            setIsOpen(false);
        } catch (error) {
            console.error("Error al crear requisito:", error);

            toast.error(
                error.response?.data?.message ||
                "Error al crear el requisito."
            );
        }
    };

    // Actualizar.
    const handleUpdate = async (formData) => {
        if (!rolEmpresa) {
            toast.error("No se encontró el rol de empresa.");
            return;
        }

        try {
            await actualizarTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                formData.id,
                buildFormData(formData)
            );

            await loadRequisitos(false);

            toast.success("Requisito actualizado.");
            setIsOpen(false);
        } catch (error) {
            console.error("Error al actualizar requisito:", error);

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar el requisito."
            );
        }
    };

    // Abrir confirmación de eliminación.
    const deleteRow = (id) => {
        const requisito = rows.find(row => row.id === id);

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

    // Eliminar.
    const handleDelete = async () => {
        if (!requisitoToDelete || eliminando) return;

        try {
            setEliminando(true);

            await eliminarTipoRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                requisitoToDelete.id
            );

            await loadRequisitos(false);

            toast.success("Requisito eliminado.");

            setDeleteModal(false);
            setRequisitoToDelete(null);
        } catch (error) {
            console.error("Error al eliminar requisito:", error);

            toast.error(
                error.response?.data?.message ||
                "Error al eliminar el requisito."
            );
        } finally {
            setEliminando(false);
        }
    };

    return (
        <div className="w-full space-y-6">

            {/* Encabezado */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="bg-red-50 p-2.5 rounded-xl">
                        <FileText className="text-[#e8192c]" size={25} />
                    </div>

                    <h1 className="text-2xl md:text-[26px] font-extrabold text-slate-800 tracking-tight">
                        Requisitos Convenio
                    </h1>
                </div>

                <p className="text-sm text-slate-500">
                    Administra los documentos requeridos para la formalización
                    de convenios empresariales.
                </p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

                    <div className="w-full sm:max-w-xs">
                        <label className="block mb-2 text-sm font-semibold text-slate-700">
                            Tipo de empresa
                        </label>

                        <select
                            value={tipoEmpresaFiltro}
                            onChange={(e) => {
                                setTipoEmpresaFiltro(e.target.value);
                                setCurrentPage(1);
                            }}
                            disabled={loading}
                            className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-700 outline-none transition focus:border-[#e8192c] focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        >
                            <option value="">Todas</option>
                            <option value="publica">Pública</option>
                            <option value="privada">Privada</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Search size={17} />

                        <span>
                            {loading
                                ? "Cargando requisitos..."
                                : `${rowsFiltradas.length} ${
                                    rowsFiltradas.length === 1
                                        ? "requisito encontrado"
                                        : "requisitos encontrados"
                                }`
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Skeleton */}
            {loading ? (
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-pulse">

                    {/* Encabezado tabla */}
                    <div className="hidden md:grid grid-cols-6 gap-4 bg-slate-50 border-b border-slate-200 px-6 py-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-4 bg-slate-200 rounded-md"
                            />
                        ))}
                    </div>

                    {/* Filas */}
                    <div className="divide-y divide-slate-100">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="px-5 md:px-6 py-5 grid grid-cols-1 md:grid-cols-6 gap-4"
                            >
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
                                    <div className="h-3 w-1/2 bg-slate-100 rounded-md md:hidden" />
                                </div>

                                <div className="h-4 w-full bg-slate-100 rounded-md hidden md:block" />

                                <div className="h-6 w-20 bg-slate-100 rounded-full" />

                                <div className="h-6 w-16 bg-slate-100 rounded-full" />

                                <div className="h-6 w-24 bg-slate-100 rounded-full" />

                                <div className="h-6 w-20 bg-slate-100 rounded-full" />
                            </div>
                        ))}
                    </div>

                    {/* Paginación skeleton */}
                    <div className="border-t border-slate-100 px-6 py-4 flex justify-between">
                        <div className="h-4 w-32 bg-slate-100 rounded-md" />
                        <div className="h-8 w-28 bg-slate-100 rounded-lg" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Tabla */}
                    <GenericTable
                        rows={rowsFiltradas}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        pageSize={8}
                        emptyMessage="No existen requisitos del convenio para este filtro."
                        columns={[
                            {
                                key: "nombre",
                                label: "Documento",
                                primary: true
                            },
                            {
                                key: "descripcion",
                                label: "Descripción"
                            },
                            {
                                key: "tipo_empresa",
                                label: "Aplica a",
                                render: row =>
                                    etiquetaTipoEmpresa(row.tipo_empresa)
                            },
                            {
                                key: "obligatorio",
                                label: "Obligatorio",
                                render: row =>
                                    row.obligatorio ? "Sí" : "No"
                            },
                            {
                                key: "plantilla",
                                label: "Plantilla",
                                render: row =>
                                    row.plantilla ? "Disponible" : "Sin plantilla"
                            },
                            {
                                key: "estado",
                                label: "Estado",
                                render: row =>
                                    row.estado ? "Activo" : "Inactivo"
                            }
                        ]}
                        actions={[
                            {
                                icon: <SquarePen size={20} />,
                                className: "hover:bg-blue-100",
                                onClick: handleEdit
                            },
                            {
                                icon: <Trash size={20} />,
                                className: "hover:bg-red-100",
                                onClick: deleteRow
                            }
                        ]}
                    />
                </>
            )}

            {/* Botón agregar */}
            {!loading && (
                <AddButton onClick={handleCreate} />
            )}

            {/* Modal crear / editar */}
            <RequisitoConvenioModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={mode === "edit" ? handleUpdate : handleSave}
                requisito={selectedRequisito}
                mode={mode}
            />

            {/* Confirmar eliminación */}
            <ConfirmModal
                isOpen={deleteModal}
                title="Eliminar requisito del convenio"
                message={`¿Está seguro de que desea eliminar el documento "${requisitoToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                confirmColor="bg-red-600 hover:bg-red-700"
                loading={eliminando}
                onConfirm={handleDelete}
                onCancel={cerrarDelete}
            />

        </div>
    );
}
