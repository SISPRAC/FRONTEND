
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash, SquarePen } from "lucide-react";

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

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedRequisito, setSelectedRequisito] = useState(null);

    // Modal de confirmación.
    const [deleteModal, setDeleteModal] = useState(false);
    const [requisitoToDelete, setRequisitoToDelete] = useState(null);
    const [eliminando, setEliminando] = useState(false);

    // Rol empresa.
    const rolEmpresa = useMemo(
        () => roles.find(r => r.nombre?.toLowerCase().includes("empresa")),
        [roles]
    );

    useEffect(() => {
        loadRoles();
        loadRequisitos();
    }, []);

    const loadRoles = async () => {
        try {
            const data = await getRoles(rolRepository);
            setRoles(data.roles);
        } catch (error) {
            console.log(error);
            toast.error("Error al cargar los roles");
        }
    };

    const loadRequisitos = async () => {
        try {
            const data = await obtenerTiposRequisitoDocumento(
                { tipoRequisitoDocumentoRepository },
                { es_requisito_convenio: true }
            );

            setRows(data);
            setCurrentPage(1);
        } catch (error) {
            console.log(error);
            toast.error("Error al cargar los requisitos del convenio");
        }
    };

    // Pública => pública + ambas. Privada => privada + ambas.
    const rowsFiltradas = useMemo(() => {
        if (!tipoEmpresaFiltro) return rows;

        return rows.filter(
            row => !row.tipo_empresa || row.tipo_empresa === tipoEmpresaFiltro
        );
    }, [rows, tipoEmpresaFiltro]);

    const buildFormData = (formData) => {
        const data = new FormData();

        data.append("nombre", formData.nombre);
        data.append("descripcion", formData.descripcion);
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
            console.log(error);

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

            await loadRequisitos();

            toast.success("Requisito creado.");
            setIsOpen(false);
        } catch (error) {
            console.log(error);

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

            await loadRequisitos();

            toast.success("Requisito actualizado.");
            setIsOpen(false);
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar."
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

            await loadRequisitos();

            toast.success("Requisito eliminado.");

            setDeleteModal(false);
            setRequisitoToDelete(null);
        } catch (error) {
            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Error al eliminar el requisito."
            );
        } finally {
            setEliminando(false);
        }
    };

    return (
        <div>
            <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-7 tracking-tight">
                Requisitos Convenio
            </h1>

            {/* Filtro */}
            <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
                <label className="block mb-2 font-semibold text-slate-700">
                    Tipo de empresa
                </label>

                <select
                    value={tipoEmpresaFiltro}
                    onChange={(e) => {
                        setTipoEmpresaFiltro(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-[#e8192c]"
                >
                    <option value="">Todas</option>
                    <option value="publica">Pública</option>
                    <option value="privada">Privada</option>
                </select>
            </div>

            {/* Tabla */}
            <GenericTable
                rows={rowsFiltradas}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={8}
                emptyMessage="No existen requisitos del convenio."
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
                        icon: <SquarePen size={22} />,
                        className: "hover:bg-blue-100",
                        onClick: handleEdit
                    },
                    {
                        icon: <Trash size={22} />,
                        className: "hover:bg-red-100",
                        onClick: deleteRow
                    }
                ]}
            />

            <AddButton onClick={handleCreate} />

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
