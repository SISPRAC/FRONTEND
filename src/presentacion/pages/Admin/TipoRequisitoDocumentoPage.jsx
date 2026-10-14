import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash, SquarePen } from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";
import AddButton from "../../components/buttons/AddButton";
import DeleteModal from "../../components/modals/DeleteModal";
import TipoRequisitoDocumentoModal from "../../components/modals/TipoRequisitoDocumentoModal.jsx";

import { rolRepository } from "../../../infraestructura/repository/rolRepository.js";
import { tipoRequisitoDocumentoRepository } from "../../../infraestructura/repository/tipoRequisitoDocumentoRepository.js";

import { getRoles } from "../../../aplicacion/rol/getRoles.js";

import { crearTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/crearTipoRequisitoDocumento.js";
import { obtenerTiposRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTiposRequisitoDocumento.js";
import { obtenerTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTipoRequisitoDocumento.js";
import { actualizarTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/actualizarTipoRequisitoDocumento.js";
import { eliminarTipoRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/eliminarTipoRequisitoDocumento.js";


export default function TipoRequisitoDocumentoPage() {

    const [roles, setRoles] = useState([]);

    const [rolSeleccionado, setRolSeleccionado] = useState("");

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedRequisito, setSelectedRequisito] = useState(null);

    const [deleteModal, setDeleteModal] = useState(false);
    const [requisitoToDelete, setRequisitoToDelete] = useState(null);


    useEffect(() => {

        loadRoles();
        loadRequisitos();

    }, []);


    const loadRoles = async () => {

        try {

            const data = await getRoles(
                rolRepository
            );

            setRoles(data.roles);

        } catch (error) {

            console.log(error);

            toast.error(
                "Error al cargar los roles"
            );

        }

    };


    const loadRequisitos = async () => {

        try {

            const data =
                await obtenerTiposRequisitoDocumento(
                    {
                        tipoRequisitoDocumentoRepository
                    }
                );

            console.log(data);

            setRows(data);
            setCurrentPage(1);

        } catch (error) {

            console.log(error);

            toast.error(
                "Error al cargar los requisitos documentales"
            );

        }

    };


    const rowsFiltradas = useMemo(() => {

        if (!rolSeleccionado)
            return rows;

        return rows.filter(
            row =>
                row.rol_id === Number(
                    rolSeleccionado
                )
        );

    }, [rows, rolSeleccionado]);


    const handleCreate = () => {

        setSelectedRequisito(null);

        setMode("create");

        setIsOpen(true);

    };


    const handleEdit = async (id) => {

        try {

            const requisito =
                await obtenerTipoRequisitoDocumento(
                    {
                        tipoRequisitoDocumentoRepository
                    },
                    id
                );

            if (!requisito) {

                toast.error(
                    "No se encontró el requisito."
                );

                return;

            }

            setSelectedRequisito(
                requisito
            );

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


    const handleSave = async (formData) => {

        try {

            const data = new FormData();

            data.append(
                "nombre",
                formData.nombre
            );

            data.append(
                "descripcion",
                formData.descripcion
            );

            data.append(
                "rol_id",
                formData.rol_id
            );

            data.append(
                "obligatorio",
                formData.obligatorio
            );

            data.append(
                "estado",
                formData.estado
            );


            if (formData.archivo) {

                data.append(
                    "archivo",
                    formData.archivo
                );

            }


            await crearTipoRequisitoDocumento(
                {
                    tipoRequisitoDocumentoRepository
                },
                data
            );


            await loadRequisitos();

            toast.success(
                "Tipo de requisito creado."
            );

            setIsOpen(false);

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Error al crear el requisito."
            );

        }

    };


    const handleUpdate = async (formData) => {

        try {

            const data = new FormData();

            data.append(
                "nombre",
                formData.nombre
            );

            data.append(
                "descripcion",
                formData.descripcion
            );

            data.append(
                "rol_id",
                formData.rol_id
            );

            data.append(
                "obligatorio",
                formData.obligatorio
            );

            data.append(
                "estado",
                formData.estado
            );


            if (formData.archivo) {

                data.append(
                    "archivo",
                    formData.archivo
                );

            }


            await actualizarTipoRequisitoDocumento(
                {
                    tipoRequisitoDocumentoRepository
                },
                formData.id,
                data
            );


            await loadRequisitos();

            toast.success(
                "Tipo de requisito actualizado."
            );

            setIsOpen(false);

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar."
            );

        }

    };

    const deleteRow = (id) => {

        const requisito =
            rows.find(
                row => row.id === id
            );

        setRequisitoToDelete(
            requisito
        );

        setDeleteModal(true);

    };


    const handleDelete = async () => {

        try {

            await eliminarTipoRequisitoDocumento(
                {
                    tipoRequisitoDocumentoRepository
                },
                requisitoToDelete.id
            );

            await loadRequisitos();

            toast.success(
                "Tipo de requisito eliminado."
            );

            setDeleteModal(false);

            setRequisitoToDelete(null);

        } catch (error) {

            console.log(error);

            toast.error(
                error.response?.data?.message ||
                "Error al eliminar."
            );

        }

    };


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
                Tipos de Requisitos Documentales
            </h1>


            <div
                className="
                    bg-white
                    rounded-2xl
                    shadow-sm
                    border
                    p-5
                    mb-6
                "
            >

                <div>

                    <label
                        className="
                            block
                            mb-2
                            font-semibold
                            text-slate-700
                        "
                    >
                        Rol
                    </label>


                    <select
                        value={rolSeleccionado}
                        onChange={(e) =>
                            setRolSeleccionado(
                                e.target.value
                            )
                        }
                        className="
                            w-full
                            rounded-xl
                            border
                            p-3
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[#e8192c]
                        "
                    >

                        <option value="">
                            Todos los roles
                        </option>


                        {
                            roles.map(
                                rol => (

                                    <option
                                        key={rol.id}
                                        value={rol.id}
                                    >
                                        {rol.nombre}
                                    </option>

                                )
                            )
                        }

                    </select>

                </div>

            </div>


            <GenericTable
                rows={rowsFiltradas}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={8}
                emptyMessage={
                    rolSeleccionado
                        ? "No existen requisitos para este rol."
                        : "No existen tipos de requisitos documentales."
                }
                columns={[
                    {
                        key: "nombre",
                        label: "Documento",
                        primary: true
                    },
                    {
                        key: "rol",
                        label: "Rol",
                        render: row =>
                            row.rol?.nombre ||
                            ""
                    },
                    {
                        key: "descripcion",
                        label: "Descripción"
                    },
                    {
                        key: "obligatorio",
                        label: "Obligatorio",
                        render: row =>
                            row.obligatorio
                                ? "Sí"
                                : "No"
                    },
                    {
                        key: "plantilla",
                        label: "Plantilla",
                        render: row =>
                            row.plantilla
                                ? "Disponible"
                                : "Sin plantilla"
                    },
                    {
                        key: "estado",
                        label: "Estado",
                        render: row =>
                            row.estado
                                ? "Activo"
                                : "Inactivo"
                    }
                ]}
                actions={[
                    {
                        icon:
                            <SquarePen size={22} />,
                        className:
                            "hover:bg-blue-100",
                        onClick: handleEdit
                    },
                    {
                        icon:
                            <Trash size={22} />,
                        className:
                            "hover:bg-red-100",
                        onClick: deleteRow
                    }
                ]}
            />


            <AddButton
                onClick={handleCreate}
            />


            <TipoRequisitoDocumentoModal
                isOpen={isOpen}
                onClose={() =>
                    setIsOpen(false)
                }
                onSubmit={
                    mode === "edit"
                        ? handleUpdate
                        : handleSave
                }
                requisito={
                    selectedRequisito
                }
                roles={roles}
            />


            <DeleteModal
                isOpen={deleteModal}
                onClose={() => {

                    setDeleteModal(false);
                    setRequisitoToDelete(null);

                }}
                onConfirm={handleDelete}
                title="Eliminar tipo de requisito documental"
                message={
                    `¿Desea eliminar el documento "${requisitoToDelete?.nombre}"?`
                }
            />

        </div>

    );

}