import Layout from "../../shared/Layouts/Layout";
import { Trash, SquarePen } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository.js";
import { getEncuestas } from "../../../aplicacion/encuesta/getEncuestas.js";
import DeleteModal from "../../components/modals/DeleteModal";
import AddButton from "../../components/buttons/AddButton";
import { eliminarEncuesta } from "../../../aplicacion/encuesta/eliminarEncuesta.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const EncuestasDirector = () => {

    const navigate = useNavigate();

    const [rows, setRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [deleteModal, setDeleteModal] = useState(false);

    const [encuestaToDelete, setEncuestaToDelete] = useState(null);


    // =============================
    // CARGAR ENCUESTAS
    // =============================

    useEffect(() => {

        loadEncuestas();

    }, []);


    const loadEncuestas = async () => {

        try {

            const data =
                await getEncuestas({
                    encuestaRepository
                });


            const formattedData =
                data.map(encuesta => {


                    // =============================
                    // Periodos de la plantilla
                    // =============================

                    const periodos =
                        encuesta.periodosPlantilla || [];


                    // =============================
                    // Total de preguntas
                    // =============================

                    const preguntas =
                        periodos.reduce(

                            (total, periodoPlantilla) => {

                                return total +
                                    (
                                        periodoPlantilla.preguntas?.length || 0
                                    );

                            },

                            0

                        );


                    // =============================
                    // Total de aplicaciones
                    // =============================

                    const aplicaciones =
                        periodos.reduce(

                            (total, periodoPlantilla) => {

                                return total +
                                    (
                                        periodoPlantilla.practicas?.length || 0
                                    );

                            },

                            0

                        );


                    // =============================
                    // Total de respuestas
                    // =============================

                    const respuestas =
                        periodos.reduce(

                            (total, periodoPlantilla) => {

                                return total +

                                    (
                                        periodoPlantilla.practicas?.reduce(

                                            (
                                                totalRespuestas,
                                                practica
                                            ) => {

                                                return totalRespuestas +

                                                    (
                                                        practica.respuestas?.length || 0
                                                    );

                                            },

                                            0

                                        ) || 0
                                    );

                            },

                            0

                        );


                    // =============================
                    // Periodos
                    // =============================

                    const nombresPeriodos =
                        periodos

                            .map(
                                periodoPlantilla =>
                                    periodoPlantilla.Periodo?.nombre
                            )

                            .filter(Boolean)

                            .join(", ");


                    // =============================
                    // Versiones
                    // =============================

                    const versiones =
                        periodos

                            .map(
                                periodoPlantilla =>
                                    periodoPlantilla.version
                            )

                            .filter(Boolean)

                            .join(", ");


                    return {

                        id: encuesta.id,

                        titulo:
                            encuesta.titulo,

                        descripcion:
                            encuesta.descripcion,

                        rol:
                            encuesta.Role?.nombre || "Sin rol",

                        periodos:
                            nombresPeriodos || "Sin periodo",

                        versiones:
                            versiones || "Sin versión",

                        preguntas,

                        aplicaciones,

                        respuestas

                    };

                });


            setRows(formattedData);

            setCurrentPage(1);


        } catch (error) {

            console.error(error);

            toast.error(
                "Error cargando encuestas"
            );

        }

    };


    // =============================
    // CREAR ENCUESTA
    // =============================

    const handleCreate = () => {

        navigate(
            "/agregarEncuesta"
        );

    };


    // =============================
    // EDITAR ENCUESTA
    // =============================

    const handleEdit = (id) => {

        navigate(
            `/editarEncuesta/${id}`
        );

    };


    // =============================
    // ELIMINAR
    // =============================

    const deleteRow = (id) => {

        const encuesta =
            rows.find(
                item => item.id === id
            );


        setEncuestaToDelete(
            encuesta
        );

        setDeleteModal(true);

    };


    // =============================
    // CONFIRMAR ELIMINACIÓN
    // =============================

    const handleDelete = async () => {

        try {

            console.log(
                "eliminar encuesta",
                encuestaToDelete.id
            );


            await eliminarEncuesta(

                {
                    encuestaRepository
                },

                encuestaToDelete.id

            );


            toast.success(
                "Encuesta eliminada"
            );


            setDeleteModal(false);

            setEncuestaToDelete(null);


            await loadEncuestas();


        } catch (error) {

            console.error(error);

            toast.error(
                "Error eliminando encuesta"
            );

        }

    };


    return (

        <Layout 
           
            footerLabel="Director"
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

                Encuestas de Satisfacción

            </h1>


            <GenericTable

                rows={rows}

                currentPage={currentPage}

                onPageChange={
                    setCurrentPage
                }


                columns={[

                    // =============================
                    // TITULO
                    // =============================

                    {
                        key: "titulo",

                        label: "Título",

                        primary: true
                    },


                    // =============================
                    // ROL
                    // =============================

                    {
                        key: "rol",

                        label: "Dirigida a"
                    },


                    // =============================
                    // PERIODOS
                    // =============================

                    {
                        key: "periodos",

                        label: "Periodos"
                    },


                    // =============================
                    // VERSIONES
                    // =============================

                    {
                        key: "versiones",

                        label: "Versiones"
                    },


                    // =============================
                    // PREGUNTAS
                    // =============================

                    {
                        key: "preguntas",

                        label: "Preguntas"
                    },


                    // =============================
                    // APLICACIONES
                    // =============================

                    {
                        key: "aplicaciones",

                        label: "Aplicaciones"
                    },


                    // =============================
                    // RESPUESTAS
                    // =============================

                    {
                        key: "respuestas",

                        label: "Respuestas"
                    }

                ]}


                actions={[

                    {
                        icon:
                            <SquarePen
                                size={24}
                            />,

                        className:
                            "hover:bg-blue-100",

                        onClick:
                            handleEdit
                    },


                    {
                        icon:
                            <Trash
                                size={24}
                            />,

                        className:
                            "hover:bg-red-100",

                        onClick:
                            deleteRow
                    }

                ]}


                emptyMessage=
                    "No hay encuestas registradas."


                pageSize={6}

            />


            <AddButton
                onClick={
                    handleCreate
                }
            />


            <DeleteModal

                isOpen={
                    deleteModal
                }


                onClose={() => {

                    setDeleteModal(false);

                    setEncuestaToDelete(
                        null
                    );

                }}


                onConfirm={
                    handleDelete
                }


                title=
                    "Eliminar Encuesta"


                message={

                    encuestaToDelete

                        ?

                        `¿Está seguro de eliminar la encuesta "${encuestaToDelete.titulo}"?`

                        :

                        "¿Está seguro de eliminar esta encuesta?"

                }

            />


        </Layout >

    );

};


export default EncuestasDirector;