import {
    Trash,
    SquarePen,
    ClipboardList,
    Loader2
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";

import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository.js";
import { getEncuestas } from "../../../aplicacion/encuesta/getEncuestas.js";

import AddButton from "../../components/buttons/AddButton";
import AsignarEncuestaModal from "../../components/modals/AsignarEncuestaModal";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { eliminarEncuesta } from "../../../aplicacion/encuesta/eliminarEncuesta.js";
import { asignarEncuestaPractica } from "../../../aplicacion/encuesta/asignarEncuesta.js";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


// ==========================================
// SKELETON
// ==========================================

const EncuestasSkeleton = ({ filas = 6 }) => (
    <div
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        aria-busy="true"
        aria-label="Cargando encuestas"
    >

        {/* ENCABEZADO */}
        <div className="grid grid-cols-7 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
            {[1, 2, 3, 4, 5, 6, 7].map((item) => (
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
                className="grid grid-cols-7 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
            >
                {/* Título */}
                <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />

                {/* Dirigida a */}
                <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />

                {/* Prácticas asignadas */}
                <div className="h-3 w-5/6 rounded bg-slate-200 animate-pulse" />

                {/* Preguntas */}
                <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />

                {/* Aplicaciones */}
                <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />

                {/* Respuestas */}
                <div className="h-3 w-8 rounded bg-slate-200 animate-pulse" />

                {/* Acciones */}
                <div className="flex items-center justify-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                </div>
            </div>
        ))}

    </div>
);


// ==========================================
// MODAL CONFIRMAR ELIMINACIÓN
// ==========================================

const ConfirmarEliminarModal = ({
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
                                Eliminando...
                            </>
                        ) : (
                            "Eliminar"
                        )}
                    </button>

                </div>

            </div>

        </div>
    );
};


const EncuestasDirector = () => {

    const navigate = useNavigate();

    const [rows, setRows] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);

    const [loading, setLoading] = useState(true);

    const [deleteModal, setDeleteModal] = useState(false);

    const [encuestaToDelete, setEncuestaToDelete] = useState(null);

    const [eliminando, setEliminando] = useState(false);

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
                (data || []).map(encuesta => {

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

        } finally {

            setLoading(false);

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


    const cerrarModalEliminar = () => {

        if (eliminando) return;

        setDeleteModal(false);

        setEncuestaToDelete(null);

    };


    // =============================
    // CONFIRMAR ELIMINACIÓN
    // =============================

    const handleDelete = async () => {

        if (eliminando || !encuestaToDelete) return;

        try {

            setEliminando(true);

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

        } finally {

            setEliminando(false);

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

                Encuestas de Satisfacción

            </h1>


            {loading ? (

                <EncuestasSkeleton />

            ) : (

                <GenericTable

                    rows={rows}

                    currentPage={currentPage}

                    onPageChange={
                        setCurrentPage
                    }


                    columns={[

                        {
                            key: "titulo",
                            label: "Título",
                            primary: true
                        },

                        {
                            key: "rol",
                            label: "Dirigida a"
                        },

                        {
                            key: "practicas",
                            label: "Prácticas asignadas"
                        },

                        {
                            key: "preguntas",
                            label: "Preguntas"
                        },

                        {
                            key: "aplicaciones",
                            label: "Aplicaciones"
                        },

                        {
                            key: "respuestas",
                            label: "Respuestas"
                        }

                    ]}


                    actions={[

                        {
                            icon: <SquarePen size={24} />,
                            className: "hover:bg-blue-100",
                            onClick: handleEdit
                        },

                        {
                            icon: <ClipboardList size={24} />,
                            className: "hover:bg-green-100",
                            onClick: handleAsignar
                        },

                        {
                            icon: <Trash size={24} />,
                            className: "hover:bg-red-100",
                            onClick: deleteRow
                        }

                    ]}


                    emptyMessage="No hay encuestas registradas."


                    pageSize={6}

                />

            )}


            <AddButton
                onClick={
                    handleCreate
                }
            />


            <ConfirmarEliminarModal

                isOpen={deleteModal}

                onClose={cerrarModalEliminar}

                onConfirm={handleDelete}

                loading={eliminando}

                title="Eliminar Encuesta"

                message={
                    encuestaToDelete
                        ? `¿Está seguro de eliminar la encuesta "${encuestaToDelete.titulo}"?`
                        : "¿Está seguro de eliminar esta encuesta?"
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

        </div>

    );

};


export default EncuestasDirector;