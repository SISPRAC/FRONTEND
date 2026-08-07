import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash, SquarePen } from "lucide-react";

import Layout from "../../shared/Layouts/Layout";

import GenericTable from "../../components/Table/GenericTable";
import AddButton from "../../components/buttons/AddButton";
import DeleteModal from "../../components/modals/DeleteModal";
import PracticaRequisitoDocumentoModal from "../../components/modals/PracticaRequisitoDocumentoModal";

import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";
import { rolRepository } from "../../../infraestructura/repository/rolRepository.js";
import { practicaRequisitoDocumentoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoRepository.js";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { getRoles } from "../../../aplicacion/rol/getRoles.js";

import { createPracticaRequisitoDocumento } from "../../../aplicacion/practicaRequisitoDocumento/createPracticaRequisitoDocumento.js";
import { updatePracticaRequisitoDocumento } from "../../../aplicacion/practicaRequisitoDocumento/updatePracticaRequisitoDocumento.js";
import { deletePracticaRequisitoDocumento } from "../../../aplicacion/practicaRequisitoDocumento/deletePracticaRequisitoDocumento.js";
import { getPracticaRequisitoDocumento } from "../../../aplicacion/practicaRequisitoDocumento/getPracticaRequisitoDocumento.js";
import { getPracticaRequisitosDocumentoByPractica } from "../../../aplicacion/practicaRequisitoDocumento/getPracticaRequisitosDocumentoByPractica.js";

export default function PracticaRequisitoDocumentoPage() {

    const [practicas, setPracticas] = useState([]);
    const [roles, setRoles] = useState([]);

    const [practicaSeleccionada, setPracticaSeleccionada] = useState("");
    const [rolSeleccionado, setRolSeleccionado] = useState("");

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedRequisito, setSelectedRequisito] = useState(null);

    const [deleteModal, setDeleteModal] = useState(false);
    const [requisitoToDelete, setRequisitoToDelete] = useState(null);

    useEffect(() => {
        loadPracticas();
        loadRoles();
    }, []);

    useEffect(() => {

        if (!practicaSeleccionada) {

            setRows([]);
            return;

        }

        loadRequisitos();

    }, [practicaSeleccionada]);

    const loadPracticas = async () => {

        try {

            const data = await getPracticas({
                practicaRepository
            });

            setPracticas(data);

        } catch (error) {

            console.log(error);

            toast.error("Error al cargar las prácticas");

        }

    };

    const loadRoles = async () => {

        try {

            const data = await getRoles(
                rolRepository
            );

            setRoles(data.roles);

        } catch (error) {

            console.log(error);

            toast.error("Error al cargar los roles");

        }

    };

    const loadRequisitos = async () => {

        try {

            const data =
                await getPracticaRequisitosDocumentoByPractica(
                    practicaRequisitoDocumentoRepository,
                    practicaSeleccionada
                );

            console.log(data);

            setRows(data);
            setCurrentPage(1);

        } catch (error) {

            console.log(error);

            toast.error("Error al cargar los requisitos");

        }

    };

    const rowsFiltradas = useMemo(() => {

        if (!rolSeleccionado)
            return rows;

        return rows.filter(
            row => row.rol_id === Number(rolSeleccionado)
        );

    }, [rows, rolSeleccionado]);

    const handleCreate = () => {

        if (!practicaSeleccionada) {

            toast.error(
                "Seleccione primero una práctica."
            );

            return;

        }

        setSelectedRequisito(null);
        setMode("create");
        setIsOpen(true);

    };

    const handleEdit = async (id) => {

        try {

            const requisito = rows.find(r => r.id === id);

            if (!requisito) {
                toast.error("No se encontró el requisito.");
                return;
            }

            setSelectedRequisito(requisito);

            setMode("edit");

            setIsOpen(true);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Error al cargar el requisito."
            );

        }

    };

    const handleSave = async (formData) => {

        try {

            await createPracticaRequisitoDocumento(
                practicaRequisitoDocumentoRepository,
                {
                    ...formData,
                    practica_id: practicaSeleccionada
                }
            );

            await loadRequisitos();

            toast.success(
                "Requisito documental creado."
            );

            setIsOpen(false);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Error al crear el requisito."
            );

        }

    };

    const handleUpdate = async (formData) => {

        try {

            await updatePracticaRequisitoDocumento(
                practicaRequisitoDocumentoRepository,
                formData.id,
                formData
            );

            await loadRequisitos();

            toast.success(
                "Requisito actualizado."
            );

            setIsOpen(false);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar."
            );

        }

    };

    const deleteRow = (id) => {

        const requisito =
            rows.find(r => r.id === id);

        setRequisitoToDelete(requisito);

        setDeleteModal(true);

    };

    const handleDelete = async () => {

        try {

            await deletePracticaRequisitoDocumento(
                practicaRequisitoDocumentoRepository,
                requisitoToDelete.id
            );

            await loadRequisitos();

            toast.success(
                "Requisito eliminado."
            );

            setDeleteModal(false);
            setRequisitoToDelete(null);

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Error al eliminar."
            );

        }

    };

    const practicaActual = practicas.find(
        practica => practica.id === Number(practicaSeleccionada)
    );

    return (

        <Layout
           
            footerLabel="Administrador"
        >

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
                Requisitos Documentales
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>

                        <label
                            className="
                                block
                                mb-2
                                font-semibold
                                text-slate-700
                            "
                        >
                            Práctica
                        </label>

                        <select
                            value={practicaSeleccionada}
                            onChange={(e) => {

                                setPracticaSeleccionada(e.target.value);
                                setRolSeleccionado("");

                            }}
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

                                Seleccione una práctica

                            </option>

                            {
                                practicas.map(practica => (

                                    <option
                                        key={practica.id}
                                        value={practica.id}
                                    >
                                        {practica.Periodo?.nombre}
                                    </option>

                                ))
                            }

                        </select>

                    </div>

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
                                setRolSeleccionado(e.target.value)
                            }
                            disabled={!practicaSeleccionada}
                            className="
                                w-full
                                rounded-xl
                                border
                                p-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#e8192c]
                                disabled:bg-slate-100
                            "
                        >

                            <option value="">

                                Todos

                            </option>

                            {
                                roles.map(rol => (

                                    <option
                                        key={rol.id}
                                        value={rol.id}
                                    >
                                        {rol.nombre}
                                    </option>

                                ))
                            }

                        </select>

                    </div>

                </div>

            </div>

            <GenericTable
                rows={rowsFiltradas}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                pageSize={8}
                emptyMessage={
                    practicaSeleccionada
                        ? "No existen requisitos documentales."
                        : "Seleccione una práctica."
                }
                columns={[
                    {
                        key: "nombre",
                        label: "Documento",
                        primary: true
                    },
                    {
                        key: "Rol",
                        label: "Rol",
                        render: row => row.rol?.nombre
                    },
                    {
                        key: "fecha_inicio",
                        label: "Inicio"
                    },
                    {
                        key: "fecha_limite",
                        label: "Fecha límite"
                    },
                    {
                        key: "obligatorio",
                        label: "Obligatorio",
                        render: row =>
                            row.obligatorio ? "Sí" : "No"
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

            {
                practicaSeleccionada && (

                    <AddButton
                        onClick={handleCreate}
                    />

                )
            }

            <PracticaRequisitoDocumentoModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={
                    mode === "edit"
                        ? handleUpdate
                        : handleSave
                }
                requisito={selectedRequisito}
                practicaId={practicaSeleccionada}
                practicaNombre={practicaActual?.Periodo?.nombre || ""}
            />

            <DeleteModal
                isOpen={deleteModal}
                onClose={() => {

                    setDeleteModal(false);
                    setRequisitoToDelete(null);

                }}
                onConfirm={handleDelete}
                title="Eliminar requisito documental"
                message={
                    `¿Desea eliminar el documento "${requisitoToDelete?.nombre}"?`
                }
            />

        </Layout>

    );

}