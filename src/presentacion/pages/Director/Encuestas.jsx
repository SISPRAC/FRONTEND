import Layout from "../../shared/Layouts/Layout";
import {
    Trash,
    SquarePen,
    ClipboardList
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";

import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository.js";
import { getEncuestas } from "../../../aplicacion/encuesta/getEncuestas.js";

import DeleteModal from "../../components/modals/DeleteModal";
import AddButton from "../../components/buttons/AddButton";
import AsignarEncuestaModal from "../../components/modals/AsignarEncuestaModal";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { eliminarEncuesta } from "../../../aplicacion/encuesta/eliminarEncuesta.js";
import { asignarEncuestaPractica } from "../../../aplicacion/encuesta/asignarEncuesta.js";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const EncuestasDirector = () => {

    const navigate = useNavigate();

    const [rows, setRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [deleteModal, setDeleteModal] = useState(false);

    const [encuestaToDelete, setEncuestaToDelete] = useState(null);

    const [asignarModal, setAsignarModal] = useState(false);

    const [encuestaToAsignar, setEncuestaToAsignar] = useState(null);

    const [practicas, setPracticas] = useState([]);

    const [encuestas, setEncuestas] = useState([]);


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

            setEncuestas(data || []);


            const practicasData =
                await getPracticas({
                    practicaRepository
                });

            setPracticas(
                practicasData || []
            );

            const formattedData =
                data.map(encuesta => {

                    const practicas =
                        encuesta.practicas || [];

                    const nombresPracticas =
                        practicas
                            .map(
                                practicaEncuesta =>
                                    practicaEncuesta.nombre
                            )
                            .filter(Boolean)
                            .join(", ");

                    return {

                        id:
                            encuesta.id,

                        titulo:
                            encuesta.titulo,

                        descripcion:
                            encuesta.descripcion,

                        rol:
                            encuesta.rol ||
                            "Sin rol",

                        practicas:
                            nombresPracticas ||
                            "Sin prácticas asignadas",

                        preguntas:
                            encuesta.preguntas,

                        aplicaciones:
                            encuesta.aplicaciones || 0,

                        respuestas:
                            encuesta.respuestas || 0

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
    // ASIGNAR ENCUESTA
    // =============================

    const handleAsignar = (id) => {

        const encuesta =
            encuestas.find(
                item => item.id === id
            );

        if (!encuesta) {

            toast.error(
                "No se encontró la encuesta"
            );

            return;

        }

        setEncuestaToAsignar(
            encuesta
        );

        setAsignarModal(true);

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
                "Eliminar encuesta",
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

    const handleCerrarAsignar = () => {

        setAsignarModal(false);

        setEncuestaToAsignar(null);

    };

    const handleAsignarSubmit = async (
        practicasSeleccionadas
    ) => {

        try {

            await asignarEncuestaPractica(
                {
                    encuestaRepository
                },
                {
                    plantilla_encuesta_id:
                        encuestaToAsignar.id,

                    practicas_ids:
                        practicasSeleccionadas
                }
            );

            toast.success(
                "Encuesta asignada correctamente"
            );

            setAsignarModal(false);

            setEncuestaToAsignar(null);

            await loadEncuestas();

        } catch (error) {

            console.error(
                "Error asignando encuesta:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Error asignando la encuesta"
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
                    // PRACTICAS
                    // =============================

                    {
                        key: "practicas",

                        label: "Prácticas asignadas"
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

                    // =============================
                    // EDITAR
                    // =============================

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


                    // =============================
                    // ASIGNAR
                    // =============================

                    {
                        icon:
                            <ClipboardList
                                size={24}
                            />,

                        className:
                            "hover:bg-green-100",

                        onClick:
                            handleAsignar
                    },


                    // =============================
                    // ELIMINAR
                    // =============================

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

            <AsignarEncuestaModal

                isOpen={
                    asignarModal
                }

                onClose={
                    handleCerrarAsignar
                }

                onSubmit={
                    handleAsignarSubmit
                }

                encuesta={
                    encuestaToAsignar
                }

                practicas={
                    practicas
                }

            />

        </Layout>

    );

};


export default EncuestasDirector;

