import {
    ArrowLeft,
    Eye,
    CalendarDays,
    ClipboardCheck,
} from "lucide-react";

import EncuestaTutorEmpresarialModal from "../../components/modals/EncuestaTutorEmpresarialModal.jsx";

import { getPracticantesGrupo } from "../../../aplicacion/tutorDocente/getPracticantesGrupo.js";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository.js";

import GenericTable from "../../components/Table/GenericTable";

import { useState, useEffect, useMemo } from "react";

import {
    useParams,
    useNavigate,
    useLocation
} from "react-router-dom";

import EstadoBadge from "../../components/estadoBadge/EstadoBadge";

import SolicitudVisitaModal from "../../components/modals/SolicitudVisitaModal.jsx";

import toast from "react-hot-toast";

import { crearSolicitudVisita } from "../../../aplicacion/solicitudVisita/crearSolicitudVisita.js";
import { editarSolicitudVisita } from "../../../aplicacion/solicitudVisita/editarSolicitudVisita.js";
import { obtenerSolicitudesVisitaTutorDocente } from "../../../aplicacion/solicitudVisita/obtenerSolicitudesVisitaTutorDocente.js";

import { solicitudVisitaRepository } from "../../../infraestructura/repository/solicitudVisitaRepository.js";
import { cancelarSolicitudVisita } from "../../../aplicacion/solicitudVisita/cancelarSolicitudVisita.js";
import { obtenerSolicitudParaGestionar } from "../../../aplicacion/solicitudVisita/obtenerSolicitudParaGestionar.js";


// Extrae los ids de practicantes que tienen alguna solicitud registrada.
const extraerIdsPracticantesConSolicitud = (solicitudes = []) => {

    const ids = new Set();

    solicitudes.forEach(solicitud => {

        (solicitud.practicantes || []).forEach(sv => {

            const idPracticante =
                sv?.practicaPracticante?.practicante?.id;

            if (idPracticante) {
                ids.add(idPracticante);
            }

        });

    });

    return ids;

};


// Obtiene la última solicitud registrada para un practicante.
const obtenerUltimaSolicitudPorPracticante = (
    solicitudes = [],
    practicanteId
) => {

    for (const solicitud of solicitudes) {

        const pertenece = (solicitud.practicantes || []).some(
            sv =>
                sv?.practicaPracticante?.practicante?.id ===
                practicanteId
        );

        if (pertenece) {
            return solicitud;
        }

    }

    return null;

};


const GrupoVistaTutorDocente = () => {

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [grupo, setGrupo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [practicanteEncuesta, setPracticanteEncuesta] = useState(null);

    const [mostrarModalSolicitud, setMostrarModalSolicitud] =
        useState(false);

    const [enviandoSolicitud, setEnviandoSolicitud] =
        useState(false);

    const [solicitudes, setSolicitudes] = useState([]);

    const navigate = useNavigate();

    const { id } = useParams();

    const location = useLocation();

    const practicaId = location.state?.practicaId;


    /*
    |--------------------------------------------------------------------------
    | Cargar todos los datos
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        cargarDatos();

    }, []);


    const cargarDatos = async () => {

        try {

            if (!practicaId) {

                toast.error(
                    "No se encontró la práctica asociada al grupo."
                );

                return;
            }

            setLoading(true);

            const [
                dataPracticantes,
                dataSolicitudes
            ] = await Promise.all([

                getPracticantesGrupo({

                    tutorDocenteRepository,
                    grupoId: id,
                    practicaId

                }),

                obtenerSolicitudesVisitaTutorDocente({

                    solicitudVisitaRepository

                })

            ]);


            const solicitudesData =
                dataSolicitudes || [];


            setSolicitudes(
                solicitudesData
            );


            console.log(
                "========== SOLICITUDES VISITA BACKEND =========="
            );

            console.log(
                JSON.parse(
                    JSON.stringify(
                        solicitudesData
                    )
                )
            );

            console.log(
                "==============================================="
            );


            /*
            |--------------------------------------------------------------------------
            | Formatear practicantes
            |--------------------------------------------------------------------------
            */

            const formattedData =
                dataPracticantes.practicantes.map(
                    practicante => {

                        const solicitud =
                            obtenerUltimaSolicitudPorPracticante(
                                solicitudesData,
                                practicante.id_practicante
                            );

                        return {

                            id:
                                practicante.id_practicante,

                            codigo:
                                practicante.codigo,

                            practicante:
                                practicante.nombre,

                            empresa:
                                practicante.empresa,

                            estado:
                                practicante.estado,

                            /*
                            |--------------------------------------------------------------------------
                            | Datos de la solicitud de visita
                            |--------------------------------------------------------------------------
                            */

                            solicitudVisitaId:
                                solicitud?.id ||
                                null,

                            estadoSolicitudVisita:
                                solicitud?.estado ||
                                null,

                            motivoSolicitudVisita:
                                solicitud?.observacion ||
                                null,
                            fechaRealizada:
                                solicitud?.visita?.fecha_realizada || null,

                            fechasPropuestas:
                                solicitud?.fechasPropuestas ||
                                []

                        };

                    }
                );


            setGrupo(
                dataPracticantes
            );


            setRows(
                formattedData
            );


            setCurrentPage(1);


        } catch (error) {

            console.error(
                "Error al cargar los datos del grupo:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Error al cargar los datos."
            );


            setRows([]);


        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | IDs de practicantes que tienen alguna solicitud
    |--------------------------------------------------------------------------
    */

    const idsConSolicitud = useMemo(

        () =>
            extraerIdsPracticantesConSolicitud(
                solicitudes
            ),

        [solicitudes]

    );


    /*
    |--------------------------------------------------------------------------
    | Ver informes del practicante
    |--------------------------------------------------------------------------
    */

    const handleView = (id) => {

        const practicante =
            rows.find(
                p => p.id === id
            );


        if (!practicante) {

            toast.error(
                "No se encontró el practicante."
            );

            return;
        }


        if (!practicante.id) {

            toast.error(
                "Este candidato aún no está matriculado como practicante."
            );

            return;
        }


        navigate(
            `/informes/${practicante.id}`,
            {
                state: {
                    practicante: {

                        id:
                            practicante.id,

                        nombre:
                            practicante.practicante,

                        empresa:
                            practicante.empresa

                    }
                }
            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | Gestionar visita de una solicitud aprobada
    |--------------------------------------------------------------------------
    */

    const handleGestionarVisita = async ({
        solicitudId
    }) => {

        if (!solicitudId) {

            toast.error(
                "No se encontró el ID de la solicitud de visita."
            );

            return;
        }

        try {

            const solicitud =
                await obtenerSolicitudParaGestionar(

                    {
                        solicitudVisitaRepository
                    },

                    solicitudId

                );


            /*
            |--------------------------------------------------------------------------
            | La consulta ya validó en backend que la solicitud
            | pertenece al tutor docente autenticado.
            |--------------------------------------------------------------------------
            */

            navigate(
                `/gestionar-visita/${solicitudId}`,
                {
                    state: {
                        solicitud
                    }
                }
            );


        } catch (error) {

            console.error(
                "Error al obtener la solicitud para gestionar:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "No fue posible obtener la solicitud de visita."
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | Cancelar solicitud
    |--------------------------------------------------------------------------
    */

    const handleCancelarSolicitud = async ({
        solicitudId,
        motivo
    }) => {

        if (!solicitudId) {

            toast.error(
                "No se encontró el ID de la solicitud."
            );

            return;
        }


        if (!motivo?.trim()) {

            toast.error(
                "Debes indicar el motivo de la cancelación."
            );

            return;
        }


        setEnviandoSolicitud(true);


        try {

            await cancelarSolicitudVisita(

                {
                    solicitudVisitaRepository
                },

                solicitudId,

                motivo.trim()

            );


            toast.success(
                "Solicitud de visita cancelada correctamente."
            );


            setMostrarModalSolicitud(false);


            await cargarDatos();


        } catch (error) {

            console.error(
                "Error al cancelar solicitud:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Error al cancelar la solicitud de visita."
            );


        } finally {

            setEnviandoSolicitud(false);

        }

    };

    const handleEncuesta = (id) => {
        const practicante = rows.find(
            (p) => p.id === id
        );

        if (!practicante) {
            toast.error("No se encontró el practicante.");
            return;
        }

        if (
            practicante.estado === "Retirado" ||
            practicante.estado === "Finalizada"
        ) {
            toast.error(
                "No se puede realizar la encuesta para este practicante."
            );
            return;
        }

        setPracticanteEncuesta({
            id_practicante: practicante.id,
            nombre: practicante.practicante,
            empresa: practicante.empresa,
            estado: practicante.estado,
        });
    };


    /*
    |--------------------------------------------------------------------------
    | Crear o editar solicitud
    |--------------------------------------------------------------------------
    */

    const handleCrearSolicitud = async ({
        solicitudId,
        editar,
        practicantes,
        fechas
    }) => {

        setEnviandoSolicitud(true);


        try {

            /*
            |--------------------------------------------------------------------------
            | EDITAR SOLICITUD RECHAZADA
            |--------------------------------------------------------------------------
            */

            if (editar) {

                if (!solicitudId) {

                    toast.error(
                        "No se encontró el ID de la solicitud que se desea editar."
                    );

                    return;
                }


                await editarSolicitudVisita(

                    {
                        solicitudVisitaRepository
                    },

                    solicitudId,

                    {
                        practicantes,
                        fechas
                    }

                );


                toast.success(
                    "Solicitud de visita actualizada correctamente."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | CREAR NUEVA SOLICITUD
            |--------------------------------------------------------------------------
            */

            else {

                await crearSolicitudVisita(

                    {
                        solicitudVisitaRepository
                    },

                    {
                        practicantes,
                        fechas
                    }

                );


                toast.success(
                    "Solicitud de visita creada correctamente."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Cerrar modal y volver a cargar datos
            |--------------------------------------------------------------------------
            */

            setMostrarModalSolicitud(false);

            await cargarDatos();


        } catch (error) {

            console.error(
                "Error al procesar solicitud de visita:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "Error al procesar la solicitud de visita."
            );


        } finally {

            setEnviandoSolicitud(false);

        }

    };

    const idsPracticantesNoSeleccionables = useMemo(
        () =>
            new Set(
                rows
                    .filter(
                        (row) =>
                            row.estado === "Retirado" ||
                            row.estado === "Finalizada"
                    )
                    .map((row) => row.id)
            ),
        [rows]
    );


    return (

        <div>


            {/* ── Volver ── */}

            <div
                className="
                    relative
                    flex
                    items-center
                    justify-center
                    mb-8
                "
            >

                <button

                    onClick={() => navigate(-1)}

                    className="
                        absolute
                        left-0
                        flex
                        items-center
                        gap-2
                        text-slate-600
                        hover:text-slate-900
                        font-medium
                        text-sm
                        px-3
                        py-2
                        rounded-md
                        hover:bg-slate-100
                        transition-colors
                    "
                >

                    <ArrowLeft size={20} />

                    Volver

                </button>

            </div>


            {/* ── Header ── */}

            <div
                className="
                    flex
                    justify-between
                    items-start
                    mb-6
                    px-1
                "
            >

                <div>

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-500
                            uppercase
                            tracking-widest
                            mb-0.5
                        "
                    >
                        Periodo Lectivo
                    </p>


                    <p
                        className="
                            text-2xl
                            font-extrabold
                            text-slate-800
                        "
                    >

                        {grupo?.practica?.periodo?.nombre || "—"}

                    </p>

                </div>


                <div className="text-right">
                    <p
                        className="
            text-xs
            font-medium
            text-slate-500
            uppercase
            tracking-widest
            mb-0.5
        "
                    >
                        Estado de la Práctica
                    </p>

                    <div className="flex justify-end mt-2">
                        <div className="scale-125 origin-right">
                            <EstadoBadge
                                estado={grupo?.practica?.estado || "Sin estado"}
                            />
                        </div>
                    </div>
                </div>

            </div>


            {/* ── Fechas de la práctica ── */}

            <div
                className="
                    flex
                    justify-center
                    gap-10
                    mb-6
                    px-1
                "
            >

                <div className="text-center">

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-500
                            uppercase
                            tracking-widest
                            mb-0.5
                        "
                    >
                        Fecha de inicio
                    </p>


                    <p
                        className="
                            text-lg
                            font-bold
                            text-slate-800
                        "
                    >

                        {grupo?.practica?.fecha_inicio || "—"}

                    </p>

                </div>


                <div className="text-center">

                    <p
                        className="
                            text-xs
                            font-medium
                            text-slate-500
                            uppercase
                            tracking-widest
                            mb-0.5
                        "
                    >
                        Fecha de fin
                    </p>


                    <p
                        className="
                            text-lg
                            font-bold
                            text-slate-800
                        "
                    >

                        {grupo?.practica?.fecha_fin || "—"}

                    </p>

                </div>

            </div>


            {/* ── Título ── */}

            <h1
                className="
                    text-[30px]
                    font-extrabold
                    text-slate-800
                    text-center
                    mb-7
                    tracking-tight
                "
            >

                {grupo?.nombre || "Grupo"}

            </h1>


            {/* ── Tabla ── */}

            <GenericTable

                rows={rows}

                loading={loading}

                currentPage={currentPage}

                onPageChange={setCurrentPage}


                columns={[

                    {
                        key: "codigo",

                        label: "Código",

                        primary: true

                    },

                    {
                        key: "practicante",

                        label: "Practicante"

                    },

                    {
                        key: "empresa",

                        label: "Empresa"

                    },

                    {
                        key: "estado",

                        label: "Estado",

                        render: (row) => (

                            <EstadoBadge
                                estado={row.estado}
                            />

                        )

                    }

                ]}


                actions={[
                    {
                        icon: <Eye size={18} />,
                        label: "Informes",
                        className: "hover:bg-blue-100 text-blue-500",
                        onClick: handleView,
                        disabled: (row) =>
                            row.estado === "Retirado" ||
                            row.estado === "Finalizada",
                        disabledTitle: "No disponible para este estado",
                    },
                    {
                        icon: <ClipboardCheck size={18} />,
                        label: "Encuesta",
                        className: "hover:bg-red-100 text-[#e8192c]",
                        onClick: handleEncuesta,
                        disabled: (row) =>
                            row.estado === "Retirado" ||
                            row.estado === "Finalizada",
                        disabledTitle: "No disponible para este estado",
                    },
                ]}


                emptyMessage="No hay Practicantes registrados."

                pageSize={7}

            />


            {/* ── Solicitar visita ── */}

            <div
                className="
                    flex
                    justify-end
                    mt-4
                "
            >

                <button

                    onClick={() =>
                        setMostrarModalSolicitud(true)
                    }

                    disabled={
                        rows.length === 0
                    }

                    className="
                        flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-lg
                        bg-[#e8192c]
                        text-white
                        font-semibold
                        text-sm
                        hover:opacity-90
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition
                    "
                >

                    <CalendarDays size={18} />

                    Solicitar visita

                </button>

            </div>


            {/* ── Modal solicitud de visita ── */}

            <SolicitudVisitaModal
                open={mostrarModalSolicitud}
                onClose={() => setMostrarModalSolicitud(false)}
                practicantes={rows}
                onSubmit={handleCrearSolicitud}
                enviando={enviandoSolicitud}
                idsConSolicitud={idsConSolicitud}
                idsPracticantesNoSeleccionables={idsPracticantesNoSeleccionables}
                onGestionarVisita={handleGestionarVisita}
                onCancelarSolicitud={handleCancelarSolicitud}
            />

            <EncuestaTutorEmpresarialModal
                mostrar={!!practicanteEncuesta}
                practicante={practicanteEncuesta}
                rolEncuesta="Tutor Docente"
                onCerrar={() => setPracticanteEncuesta(null)}
            />


        </div>

    );

};


export default GrupoVistaTutorDocente;