import {
    ArrowLeft,
    Eye,
    CalendarDays,
    ClipboardCheck,
    FileText,
    Award,
    LoaderCircle
} from "lucide-react";

import EncuestaTutorEmpresarialModal from "../../components/modals/EncuestaTutorEmpresarialModal.jsx";
import VerRetiroModal from "../../components/modals/VerRetiroModal.jsx";
import CertificadoPracticanteModal from "../../components/modals/CertificadoPracticanteModal.jsx";
import GrupoVistaTutorSkeleton from "../../components/skeletons/GrupoVistaTutorSkeleton.jsx";

import { getPracticantesGrupo } from "../../../aplicacion/tutorDocente/getPracticantesGrupo.js";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository.js";

import GenericTable from "../../components/Table/GenericTable";

import { useState, useEffect, useMemo } from "react";

import { ClipboardList } from "lucide-react";
import { obtenerRespuestasEncuestasPracticante } from "../../../aplicacion/encuesta/obtenerRespuestasEncuestasPracticante";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository";
import EncuestasPracticanteDirectorModal from "../../components/modals/EncuestasPracticanteDirectorModal";

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


/*
|--------------------------------------------------------------------------
| Estados con acceso restringido.
| Retirado y Cancelado solo pueden consultar el retiro.
| Finalizada puede hacer todo (informes, encuesta, certificado, visitas).
|--------------------------------------------------------------------------
*/

const ESTADOS_SIN_ACCESO = ["Retirado", "Cancelado"];

const bloqueadoPorEstado = (row) =>
    ESTADOS_SIN_ACCESO.includes(row.estado);

const sinRetiro = (row) =>
    !ESTADOS_SIN_ACCESO.includes(row.estado);


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

const certificadoVacio = {
    open: false,
    practicante: null,
    certificado: null,
    loading: false,
};


const GrupoVistaTutorDocente = () => {

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [grupo, setGrupo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [practicanteEncuesta, setPracticanteEncuesta] = useState(null);

    const [mostrarEncuestas, setMostrarEncuestas] = useState(false);
    const [mostrarDetalleEncuesta, setMostrarDetalleEncuesta] = useState(false);
    const [encuestasPracticante, setEncuestasPracticante] = useState([]);
    const [practicanteEncuestasSeleccionado, setPracticanteEncuestasSeleccionado] = useState(null);
    const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
    const [loadingEncuestasId, setLoadingEncuestasId] = useState(null);

    const [mostrarModalSolicitud, setMostrarModalSolicitud] =
        useState(false);

    const [enviandoSolicitud, setEnviandoSolicitud] =
        useState(false);

    const [solicitudes, setSolicitudes] = useState([]);

    // Ver retiro / ver certificado
    const [verRetiroPracticante, setVerRetiroPracticante] = useState(null);
    const [certificadoModal, setCertificadoModal] = useState(certificadoVacio);

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

            console.log("datos practicantes", dataPracticantes);


            const solicitudesData =
                dataSolicitudes || [];


            setSolicitudes(
                solicitudesData
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

                            correo: practicante.correo,

                            empresa:
                                practicante.empresa,

                            estado:
                                practicante.estado,

                            retiro:
                                practicante.retiro ?? null,

                            certificado:
                                practicante.certificado ?? null,

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


    const handleVerEncuestas = async (id) => {
        const practicante = rows.find((p) => p.id === id);

        if (!practicante) {
            toast.error("No se encontró el practicante.");
            return;
        }

        setLoadingEncuestasId(id);
        const toastId = toast.loading("Consultando encuestas del practicante...");

        try {
            const respuesta = await obtenerRespuestasEncuestasPracticante(
                { encuestaRepository },
                practicante.id
            );

            console.log("Respuesats obtenidas", respuesta);

            const practicas = respuesta?.data ?? respuesta;

            const tieneEncuestas =
                Array.isArray(practicas) &&
                practicas.some((p) => Array.isArray(p.encuestas) && p.encuestas.length > 0);

            if (!tieneEncuestas) {
                toast.dismiss(toastId);
                toast.error("Este practicante no tiene encuestas respondidas.");
                return;
            }

            setPracticanteEncuestasSeleccionado({
                id_practicante: practicante.id,
                nombre: practicante.practicante,
                codigo: practicante.codigo,
                empresa: practicante.empresa,
            });
            setEncuestasPracticante(practicas);
            setMostrarEncuestas(true);
            toast.dismiss(toastId);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error(
                error.response?.data?.message ||
                "No se pudieron consultar las encuestas del practicante."
            );
        } finally {
            setLoadingEncuestasId(null);
        }
    };

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


    /*
    |--------------------------------------------------------------------------
    | Encuesta
    |--------------------------------------------------------------------------
    */

    const handleEncuesta = (id) => {
        const practicante = rows.find(
            (p) => p.id === id
        );

        if (!practicante) {
            toast.error("No se encontró el practicante.");
            return;
        }

        if (bloqueadoPorEstado(practicante)) {
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
    | Ver retiro
    |--------------------------------------------------------------------------
    */

    const handleVerRetiro = (id) => {
        const practicante = rows.find((p) => p.id === id);

        if (!practicante) {
            toast.error("No se encontró el practicante.");
            return;
        }

        setVerRetiroPracticante({
            ...practicante,
            nombres: practicante.practicante,
            apellidos: "",
        });
    };


    /*
    |--------------------------------------------------------------------------
    | Ver certificado (solo consulta)
    |--------------------------------------------------------------------------
    */

    const handleVerCertificado = (id) => {
        const practicante = rows.find((p) => p.id === id);

        if (!practicante) {
            toast.error("No se encontró el practicante.");
            return;
        }

        const cert = practicante.certificado;

        if (!cert?.archivo?.url) {
            toast.error("Aún no se le ha subido el certificado a este practicante.");
            return;
        }

        setCertificadoModal({
            open: true,
            practicante: { nombres: practicante.practicante, apellidos: "" },
            certificado: {
                id: cert.id,
                nombre: cert.archivo.nombre,
                url: cert.archivo.url,
                fecha_subida: cert.fecha_subida,
            },
            loading: false,
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


    /*
    |--------------------------------------------------------------------------
    | Practicantes que no se pueden seleccionar para una visita
    |--------------------------------------------------------------------------
    */

    const idsPracticantesNoSeleccionables = useMemo(
        () =>
            new Set(
                rows
                    .filter(bloqueadoPorEstado)
                    .map((row) => row.id)
            ),
        [rows]
    );

    if (loading) {
        return <GrupoVistaTutorSkeleton />;
    }

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
                    { key: "correo", label: "Correo" },

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
                        disabled: bloqueadoPorEstado,
                        disabledTitle: "No disponible para este estado",
                    },
                    {
                        icon: loadingEncuestasId !== null
                            ? <LoaderCircle size={18} className="animate-spin" />
                            : <ClipboardList size={18} />,
                        label: "Ver encuestas",
                        className: "text-purple-600 hover:bg-purple-100",
                        onClick: handleVerEncuestas,
                        disabled: (row) => bloqueadoPorEstado(row) || loadingEncuestasId !== null,
                        disabledTitle: "No disponible para este estado",
                    },
                    {
                        icon: <ClipboardCheck size={18} />,
                        label: "Responder encuesta",
                        className: "hover:bg-red-100 text-[#e8192c]",
                        onClick: handleEncuesta,
                        disabled: bloqueadoPorEstado,
                        disabledTitle: "No disponible para este estado",
                    },
                    {
                        icon: <FileText size={18} />,
                        label: "Ver retiro",
                        className: "text-rose-600 hover:bg-rose-100",
                        onClick: handleVerRetiro,
                        disabled: sinRetiro,
                        disabledTitle:
                            "Solo disponible para practicantes retirados o cancelados",
                    },
                    {
                        icon: <Award size={18} />,
                        label: "Certificado",
                        className: "text-emerald-600 hover:bg-emerald-100",
                        onClick: handleVerCertificado,
                        disabled: bloqueadoPorEstado,
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

            {/* Lista de encuestas (solo consulta) */}
            <EncuestasPracticanteDirectorModal
                mostrar={mostrarEncuestas}
                practicante={practicanteEncuestasSeleccionado}
                practicas={encuestasPracticante}
                onCerrar={() => {
                    setMostrarEncuestas(false);
                    setEncuestaSeleccionada(null);
                }}
                onVerDetalle={(encuesta) => {
                    setEncuestaSeleccionada(encuesta);
                    setMostrarDetalleEncuesta(true);
                }}
            />

            {/* Detalle en modo consulta */}
            <EncuestaTutorEmpresarialModal
                mostrar={mostrarDetalleEncuesta}
                practicante={practicanteEncuestasSeleccionado}
                rolEncuesta={encuestaSeleccionada?.plantilla?.Role?.nombre || "Practicante"}
                modoConsulta={true}
                encuestaSeleccionada={encuestaSeleccionada}
                onCerrar={() => {
                    setMostrarDetalleEncuesta(false);
                    setEncuestaSeleccionada(null);
                }}
            />

            {/* Responder */}
            <EncuestaTutorEmpresarialModal
                mostrar={!!practicanteEncuesta}
                practicante={practicanteEncuesta}
                rolEncuesta="Tutor Docente"
                onCerrar={() => setPracticanteEncuesta(null)}
            />

            {/* ── Modal para ver el retiro ── */}

            <VerRetiroModal
                open={!!verRetiroPracticante}
                practicante={verRetiroPracticante}
                onClose={() => setVerRetiroPracticante(null)}
            />

            {/* ── Modal del certificado (solo consulta) ── */}

            <CertificadoPracticanteModal
                open={certificadoModal.open}
                practicante={certificadoModal.practicante}
                certificado={certificadoModal.certificado}
                loading={certificadoModal.loading}
                soloConsulta
                onClose={() => setCertificadoModal(certificadoVacio)}
            />


        </div>

    );

};


export default GrupoVistaTutorDocente;