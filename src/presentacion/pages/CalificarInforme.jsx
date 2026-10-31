import { useState, useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { obtenerEntregasInformePorPracticante } from "../../aplicacion/entregaInforme/obtenerEntregasInformePorPracticante.js";
import { revisarEntregaInformeTutorDocente } from "../../aplicacion/entregaInforme/revisarEntregaInformeTutorDocente.js";
import { revisarEntregaInformeTutorEmpresarial } from "../../aplicacion/entregaInforme/revisarEntregaInformeTutorEmpresarial.js";
import { entregaInformeRepository } from "../../infraestructura/repository/entregaInformeRepository.js";

import { obtenerPracticantePorId } from "../../aplicacion/practicante/getPracticante.js";
import { obtenerRequisitosDocumentosPracticante } from "../../aplicacion/practicante/obtenerRequisitosDocumentosPracticante.js";
import { practicanteRepository } from "../../infraestructura/repository/practicanteRepository.js";

import ConfirmModal from "../components/modals/ConfirmModal.jsx";

// Componente y utilidad compartidos (ajusta la ruta a tu estructura)
import TrazabilidadTimeline from "../components/Trazabilidadtimeline.jsx";
import { construirTrazabilidad } from "../components/Construirtrazabilidad.jsx";

import {
    CheckCircle2,
    XCircle,
    ArrowLeft
} from "lucide-react";

import toast from "react-hot-toast";


// ─────────────────────────────────────────────────────────
// TIPOS DE INFORME POR DEFECTO
// ─────────────────────────────────────────────────────────

const TIPOS_POR_DEFECTO = [
    {
        id: "plan_trabajo",
        nombre: "Plan de Trabajo",
        fechaInicio: null,
        fechaMaxima: null,
        practicaRequisitoId: null
    },
    {
        id: "informe_parcial",
        nombre: "Informe Parcial",
        fechaInicio: null,
        fechaMaxima: null,
        practicaRequisitoId: null
    },
    {
        id: "informe_final",
        nombre: "Informe Final",
        fechaInicio: null,
        fechaMaxima: null,
        practicaRequisitoId: null
    }
];


const ROL_TUTOR_EMPRESARIAL = "Tutor Empresarial";
const ROL_TUTOR_DOCENTE = "Tutor Docente";
const ROL_DIRECTOR = "Director"; // ajusta al nombre exacto que guardas en rolActivo


// ─────────────────────────────────────────────────────────
// ESTADOS DE REVISIÓN
// ─────────────────────────────────────────────────────────

const ESTADO_APROBADO = "APROBADO";
const ESTADO_RECHAZADO = "RECHAZADO";
const ESTADO_PENDIENTE = "PENDIENTE";


/*
 * Props opcionales:
 *  - soloLectura (boolean, por defecto false): si es true se ocultan
 *    observación, Aprobar/Rechazar y el modal. Si no se pasa, la vista
 *    funciona normal para los tutores.
 *    También se activa solo cuando el rol activo es Director.
 */
export default function VistaInformePracticante({ soloLectura: soloLecturaProp = false }) {

    const location = useLocation();

    const navigate = useNavigate();


    /*
     * El practicante viene desde MisAperturasTutorEmpresarial
     * (o la pantalla del director) mediante navigate(..., { state }).
     */

    const practicante = location.state?.practicante ?? null;

    const practicanteId = practicante?.id;


    const [sesion] = useState(() => {

        const rolActivoInicial =
            localStorage.getItem("rolActivo");

        return {
            rolActivo: rolActivoInicial
        };

    });


    const rolReal = sesion?.rolActivo;


    const esTutorEmpresarial =
        rolReal === ROL_TUTOR_EMPRESARIAL;

    const esTutorDocente =
        rolReal === ROL_TUTOR_DOCENTE;

    const esDirector =
        rolReal === ROL_DIRECTOR;

    // Solo lectura: por prop o porque el rol activo es Director.
    // En este modo se ve el estado, los comentarios y el historial,
    // pero no aparece nada para calificar.
    const soloLectura = soloLecturaProp || esDirector;


    // ─────────────────────────────────────────────────────────
    // ESTADOS
    // ─────────────────────────────────────────────────────────

    const [tiposInforme, setTiposInforme] = useState([]);

    const [informes, setInformes] = useState([]);

    const [tipoSeleccionadoId, setTipoSeleccionadoId] =
        useState(null);

    const [cargando, setCargando] = useState(true);

    const [cargandoEntrega, setCargandoEntrega] =
        useState(false);

    const [observacion, setObservacion] = useState("");

    const [enviandoRevision, setEnviandoRevision] =
        useState(false);

    const [modalAbierto, setModalAbierto] = useState(false);

    const [accionPendiente, setAccionPendiente] =
        useState(null);

    // Pestaña del panel derecho: "revision" | "historial"
    const [vistaPanel, setVistaPanel] = useState("revision");


    // ─────────────────────────────────────────────────────────
    // CARGA INICIAL
    // ─────────────────────────────────────────────────────────

    useEffect(() => {

        if (!practicanteId) {

            setTiposInforme(TIPOS_POR_DEFECTO);

            setTipoSeleccionadoId(TIPOS_POR_DEFECTO[0].id);

            setCargando(false);

            return;

        }

        cargarDatos();

    }, [practicanteId]);


    // ─────────────────────────────────────────────────────────
    // CARGAR DATOS DEL PRACTICANTE Y REQUISITOS
    // ─────────────────────────────────────────────────────────

    const cargarDatos = async () => {

        try {

            setCargando(true);

            // Siempre partimos de los tres tipos
            const tiposBase = TIPOS_POR_DEFECTO.map(
                (tipo) => ({ ...tipo })
            );

            // Obtener practicante
            await obtenerPracticantePorId(
                practicanteRepository,
                practicanteId
            );

            // Obtener requisitos configurados
            const requisitos =
                await obtenerRequisitosDocumentosPracticante(
                    { practicanteRepository },
                    practicanteId
                );

            // Mezclar los datos reales con los tres tipos
            // que siempre deben aparecer
            const tiposFinales =
                tiposBase.map((tipoDefault) => {

                    const requisitoEncontrado =
                        Array.isArray(requisitos)
                            ? requisitos.find(
                                (requisito) =>
                                    requisito.nombre
                                        ?.trim()
                                        .toLowerCase() ===
                                    tipoDefault.nombre
                                        .trim()
                                        .toLowerCase()
                            )
                            : null;

                    if (!requisitoEncontrado) {
                        return { ...tipoDefault };
                    }

                    return {
                        ...tipoDefault,
                        practicaRequisitoId:
                            requisitoEncontrado.id ?? null,
                        fechaInicio:
                            requisitoEncontrado.fechaInicio ?? null,
                        fechaMaxima:
                            requisitoEncontrado.fechaMaxima ?? null
                    };

                });

            setTiposInforme(tiposFinales);

            // Seleccionar siempre el primer tipo
            setTipoSeleccionadoId(tiposFinales[0].id);

        } catch (error) {

            console.error(
                "Error al cargar datos de informes:",
                error
            );

            // Aunque falle la consulta, dejamos
            // disponibles los tres tipos.
            setTiposInforme(TIPOS_POR_DEFECTO);

            setTipoSeleccionadoId(TIPOS_POR_DEFECTO[0].id);

            toast.error(
                "No se pudieron cargar los datos de los informes"
            );

        } finally {

            setCargando(false);

        }

    };


    // ─────────────────────────────────────────────────────────
    // OBTENER ENTREGA DEL TIPO SELECCIONADO
    // ─────────────────────────────────────────────────────────

    useEffect(() => {

        if (
            !practicanteId ||
            !tipoSeleccionadoId ||
            tiposInforme.length === 0
        ) {

            setInformes([]);

            return;

        }

        cargarEntrega();

    }, [
        practicanteId,
        tipoSeleccionadoId,
        tiposInforme
    ]);


    const cargarEntrega = async () => {

        try {

            setCargandoEntrega(true);

            if (!practicanteId || !tipoSeleccionadoId) {

                setInformes([]);

                return;

            }

            const tipoActual =
                tiposInforme.find(
                    (tipo) => tipo.id === tipoSeleccionadoId
                );

            /*
             * Si el tipo existe en el select pero todavía
             * no tiene un PracticaRequisitoDocumento
             * configurado, no hay nada que consultar.
             */

            if (!tipoActual?.practicaRequisitoId) {

                setInformes([]);

                return;

            }

            const entregas =
                await obtenerEntregasInformePorPracticante(
                    { entregaInformeRepository },
                    practicanteId,
                    tipoActual.practicaRequisitoId
                );

            setInformes(
                Array.isArray(entregas) ? entregas : []
            );

        } catch (error) {

            console.error("Error al cargar entrega:", error);

            setInformes([]);

        } finally {

            setCargandoEntrega(false);

        }

    };


    // ─────────────────────────────────────────────────────────
    // TIPO SELECCIONADO
    // ─────────────────────────────────────────────────────────

    const tipoSeleccionado =
        tiposInforme.find(
            (tipo) => tipo.id === tipoSeleccionadoId
        );


    // ─────────────────────────────────────────────────────────
    // ENTREGAS DEL TIPO SELECCIONADO (todas las versiones)
    // ─────────────────────────────────────────────────────────

    const entregasDelTipo =
        informes.filter(
            (informe) =>
                informe.practica_requisito_documento_id ===
                tipoSeleccionado?.practicaRequisitoId
        );


    // ─────────────────────────────────────────────────────────
    // INFORME ACTUAL
    // ─────────────────────────────────────────────────────────
    // Puede haber varias versiones. Se toma la de mayor versión.

    const informeActual =
        entregasDelTipo.reduce(
            (masReciente, actual) => {

                if (!masReciente) {
                    return actual;
                }

                return (actual.version ?? 0) >
                    (masReciente.version ?? 0)
                    ? actual
                    : masReciente;

            },
            null
        );


    // ─────────────────────────────────────────────────────────
    // HISTORIAL (todas las versiones, función compartida)
    // ─────────────────────────────────────────────────────────

    const trazabilidad = construirTrazabilidad(entregasDelTipo);


    // ─────────────────────────────────────────────────────────
    // URL DEL ARCHIVO
    // ─────────────────────────────────────────────────────────

    const archivoUrl =
        informeActual?.archivo?.url ?? null;


    // ─────────────────────────────────────────────────────────
    // ESTADO DE ENTREGA
    // ─────────────────────────────────────────────────────────

    const estadoEntrega = (() => {

        if (!tipoSeleccionado) {
            return null;
        }

        /*
         * Si todavía no existe fecha máxima,
         * no podemos determinar si está retrasado.
         */

        if (!tipoSeleccionado.fechaMaxima) {

            if (informeActual?.fecha_entrega) {

                return {
                    entregado: true,
                    fecha: informeActual.fecha_entrega,
                    retrasado: false
                };

            }

            return {
                entregado: false,
                fecha: null,
                retrasado: false
            };

        }

        const ahora = new Date();

        const fechaMaxima =
            new Date(tipoSeleccionado.fechaMaxima);

        if (informeActual?.fecha_entrega) {

            const fechaEntrega =
                new Date(informeActual.fecha_entrega);

            return {
                entregado: true,
                fecha: informeActual.fecha_entrega,
                retrasado: fechaEntrega > fechaMaxima
            };

        }

        return {
            entregado: false,
            fecha: null,
            retrasado: ahora > fechaMaxima
        };

    })();


    // ─────────────────────────────────────────────────────────
    // ESTADOS DE REVISIÓN
    // ─────────────────────────────────────────────────────────

    const normalizarEstado = (estado) =>
        !estado || estado === ESTADO_PENDIENTE
            ? null
            : estado;


    const estadoTutorEmpresarial =
        normalizarEstado(
            informeActual?.estado_tutor_empresarial
        );

    const observacionTutorEmpresarial =
        informeActual?.observacion_tutor_empresarial ?? null;

    const estadoTutorDocente =
        normalizarEstado(
            informeActual?.estado_tutor_docente
        );

    const observacionTutorDocente =
        informeActual?.observacion_tutor_docente ?? null;


    // TUTOR EMPRESARIAL APROBÓ
    const tutorEmpresarialAprobo =
        estadoTutorEmpresarial === ESTADO_APROBADO;


    // ESTADO PROPIO
    const estadoPropio = esTutorEmpresarial
        ? estadoTutorEmpresarial
        : esTutorDocente
            ? estadoTutorDocente
            : null;

    const yaEvaluado = Boolean(estadoPropio);


    // ─────────────────────────────────────────────────────────
    // PUEDE CALIFICAR
    // (el director nunca entra: no es tutor empresarial ni docente)
    // ─────────────────────────────────────────────────────────

    const puedeCalificar =
        !soloLectura &&
        Boolean(informeActual) &&
        !cargandoEntrega &&
        !yaEvaluado &&
        (
            esTutorEmpresarial ||
            (
                esTutorDocente &&
                tutorEmpresarialAprobo
            )
        );


    // ─────────────────────────────────────────────────────────
    // LIMPIAR OBSERVACIÓN
    // ─────────────────────────────────────────────────────────

    useEffect(() => {

        setObservacion("");

    }, [
        tipoSeleccionadoId,
        informeActual?.id
    ]);


    // ─────────────────────────────────────────────────────────
    // CAMBIAR TIPO DE INFORME
    // ─────────────────────────────────────────────────────────

    const handleCambiarTipo = (nuevoId) => {

        /*
         * IMPORTANTE: NO usamos Number().
         * Los IDs del select son strings:
         * "plan_trabajo", "informe_parcial", "informe_final"
         */

        setTipoSeleccionadoId(nuevoId);

    };


    // ─────────────────────────────────────────────────────────
    // VOLVER
    // ─────────────────────────────────────────────────────────

    const handleVolver = () => {

        navigate(-1);

    };


    // ─────────────────────────────────────────────────────────
    // REVISAR ENTREGA
    // ─────────────────────────────────────────────────────────

    const handleRevisar = async (estado) => {

        if (soloLectura) {

            toast.error("Tu rol solo permite consultar los informes");

            return false;

        }

        if (!informeActual) {

            toast.error(
                "Aún no hay un informe cargado para revisar"
            );

            return false;

        }

        if (esTutorDocente && !tutorEmpresarialAprobo) {

            toast.error(
                "Debes esperar a que el Tutor Empresarial apruebe este informe antes de calificarlo"
            );

            return false;

        }

        if (yaEvaluado) {

            toast.error("Ya evaluaste este informe");

            return false;

        }

        if (
            estado === ESTADO_RECHAZADO &&
            !observacion.trim()
        ) {

            toast.error("Debes indicar el motivo del rechazo");

            return false;

        }

        try {

            setEnviandoRevision(true);

            const observacionLimpia =
                observacion.trim()
                    ? observacion.trim()
                    : null;

            if (esTutorEmpresarial) {

                await revisarEntregaInformeTutorEmpresarial(
                    { entregaInformeRepository },
                    informeActual.id,
                    {
                        estado_tutor_empresarial: estado,
                        observacion_tutor_empresarial:
                            observacionLimpia
                    }
                );

            } else if (esTutorDocente) {

                await revisarEntregaInformeTutorDocente(
                    { entregaInformeRepository },
                    informeActual.id,
                    {
                        estado_tutor_docente: estado,
                        observacion_tutor_docente:
                            observacionLimpia
                    }
                );

            }

            toast.success("Revisión guardada correctamente");

            setObservacion("");

            await cargarEntrega();

            return true;

        } catch (error) {

            console.error("Error al revisar la entrega:", error);

            console.error(
                "Respuesta del servidor:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "No se pudo guardar la revisión"
            );

            return false;

        } finally {

            setEnviandoRevision(false);

        }

    };


    // ─────────────────────────────────────────────────────────
    // MODAL DE CONFIRMACIÓN
    // ─────────────────────────────────────────────────────────

    const abrirConfirmacion = (estado) => {

        setAccionPendiente(estado);

        setModalAbierto(true);

    };


    const cerrarConfirmacion = () => {

        setModalAbierto(false);

        setAccionPendiente(null);

    };


    const confirmarAccion = async () => {

        const exito = await handleRevisar(accionPendiente);

        if (exito) {
            cerrarConfirmacion();
        }

    };


    const configModal = {

        [ESTADO_APROBADO]: {
            title: "Aprobar informe",
            message:
                "¿Estás seguro de que deseas aprobar este informe? Esta acción no se puede deshacer.",
            confirmLabel: "Sí, aprobar",
            confirmColor: "bg-emerald-600 hover:bg-emerald-700",
            showTextarea: false
        },

        [ESTADO_RECHAZADO]: {
            title: "Rechazar informe",
            message:
                "¿Estás seguro de que deseas rechazar este informe? Esta acción no se puede deshacer.",
            confirmLabel: "Sí, rechazar",
            confirmColor: "bg-red-600 hover:bg-red-700",
            showTextarea: true,
            textareaLabel: "Motivo del rechazo"
        }

    };


    // ─────────────────────────────────────────────────────────
    // BADGE DE ESTADO DE REVISIÓN
    // ─────────────────────────────────────────────────────────

    const renderBadgeEstadoRevision = (estado) => {

        if (!estado) {

            return (

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                    Pendiente
                </span>

            );

        }

        const estilosPorEstado = {
            [ESTADO_APROBADO]:
                "bg-emerald-50 text-emerald-600 border border-emerald-200",
            [ESTADO_RECHAZADO]:
                "bg-red-50 text-red-600 border border-red-200"
        };

        const etiquetasPorEstado = {
            [ESTADO_APROBADO]: "Aprobado",
            [ESTADO_RECHAZADO]: "Rechazado"
        };

        return (

            <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${estilosPorEstado[estado] ??
                    "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
            >

                {etiquetasPorEstado[estado] ?? estado}

            </span>

        );

    };


    // ─────────────────────────────────────────────────────────
    // VALIDACIÓN DEL PRACTICANTE
    // ─────────────────────────────────────────────────────────

    if (!practicante) {

        return (

            <div className="p-5">

                <div className="bg-white border border-gray-200 rounded-xl p-6">

                    <p className="text-gray-500">
                        No se encontró la información del practicante.
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="flex flex-col h-full min-h-0">

            <>

                {cargando ? (

                    <div className="flex flex-1 items-center justify-center h-full">

                        <div className="flex flex-col items-center justify-center gap-2 text-[#e8192c]">

                            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#e8192c] rounded-full animate-spin" />

                            <span className="text-sm font-medium">
                                Cargando...
                            </span>

                        </div>

                    </div>

                ) : (

                    <div className="flex flex-col flex-1 min-h-0 lg:overflow-hidden overflow-y-auto gap-4">


                        {/* ─────────────────────────────────────────
                            HEADER
                        ───────────────────────────────────────── */}

                        <div className="flex items-center justify-between flex-wrap gap-3 flex-shrink-0">

                            <div className="flex items-center gap-3">

                                <button
                                    type="button"
                                    onClick={handleVolver}
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition-colors"
                                >

                                    <ArrowLeft className="w-4 h-4" />

                                </button>

                                <div>

                                    <h1 className="text-xl font-semibold text-gray-900">
                                        Informes del practicante
                                    </h1>

                                    <p className="text-sm text-gray-400 mt-0.5">
                                        {practicante.nombre}
                                    </p>

                                </div>

                            </div>

                            <div className="flex items-center gap-2">

                                <select
                                    value={tipoSeleccionadoId ?? ""}
                                    onChange={(e) =>
                                        handleCambiarTipo(e.target.value)
                                    }
                                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300"
                                >

                                    {tiposInforme.map((tipo) => (

                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>

                                    ))}

                                </select>

                            </div>

                        </div>


                        {/* ─────────────────────────────────────────
                            INFORMACIÓN DE FECHAS
                        ───────────────────────────────────────── */}

                        {tipoSeleccionado && (

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm">

                                <div className="flex flex-wrap gap-x-6 gap-y-1 text-gray-500">

                                    <span>

                                        Apertura:{" "}

                                        <span className="text-gray-800 font-medium">

                                            {tipoSeleccionado.fechaInicio
                                                ? new Date(
                                                    tipoSeleccionado.fechaInicio
                                                ).toLocaleDateString("es-CO")
                                                : "Por definir"
                                            }

                                        </span>

                                    </span>

                                    <span>

                                        Fecha máxima:{" "}

                                        <span className="text-gray-800 font-medium">

                                            {tipoSeleccionado.fechaMaxima
                                                ? new Date(
                                                    tipoSeleccionado.fechaMaxima
                                                ).toLocaleDateString("es-CO")
                                                : "Por definir"
                                            }

                                        </span>

                                    </span>

                                </div>

                                {cargandoEntrega ? (

                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                        Cargando entrega...
                                    </span>

                                ) : estadoEntrega?.entregado ? (

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${estadoEntrega.retrasado
                                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                                            : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                            }`}
                                    >

                                        {estadoEntrega.retrasado
                                            ? "Entregado con retraso el "
                                            : "Entregado el "
                                        }

                                        {new Date(
                                            estadoEntrega.fecha
                                        ).toLocaleDateString("es-CO")}

                                    </span>

                                ) : (

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${estadoEntrega?.retrasado
                                            ? "bg-red-50 text-red-600 border border-red-200"
                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                            }`}
                                    >

                                        {estadoEntrega?.retrasado
                                            ? "No cargado · plazo vencido"
                                            : "No cargado"
                                        }

                                    </span>

                                )}

                            </div>

                        )}


                        {/* ─────────────────────────────────────────
                            CUERPO
                        ───────────────────────────────────────── */}

                        <div className="flex flex-col lg:flex-row flex-1 min-h-0 gap-4 overflow-y-auto lg:overflow-visible">

                            {/* VISOR */}

                            <div className="flex-1 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white min-h-0 min-w-0 h-[60vh] lg:h-auto">

                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">

                                    <div className="flex items-center gap-2 text-sm text-gray-500 truncate min-w-0">

                                        <svg
                                            className="w-4 h-4 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth={1.5}
                                            viewBox="0 0 24 24"
                                        >

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                                            />

                                        </svg>

                                        <span className="truncate">

                                            {tipoSeleccionado?.nombre ?? "Informe"}{" "}

                                            {practicante.nombre}.pdf

                                        </span>

                                    </div>

                                </div>

                                <div className="flex-1 overflow-y-auto bg-gray-100 min-h-0">

                                    {cargandoEntrega ? (

                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            Cargando documento...
                                        </div>

                                    ) : archivoUrl ? (

                                        <iframe
                                            src={archivoUrl}
                                            title="Informe PDF"
                                            className="w-full h-full border-0"
                                            style={{ minHeight: "100%" }}
                                        />

                                    ) : (

                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            El practicante aún no ha cargado este informe
                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* ─────────────────────────────────────
                                PANEL DERECHO (Revisión / Historial)
                            ───────────────────────────────────── */}

                            <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border border-gray-200 rounded-xl bg-white p-4 gap-4 overflow-y-auto min-h-0">

                                {/* PESTAÑAS */}

                                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">

                                    {[
                                        { id: "revision", label: "Revisión" },
                                        { id: "historial", label: "Historial" },
                                    ].map((t) => (

                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setVistaPanel(t.id)}
                                            className={`flex-1 text-xs font-medium rounded-md py-1.5 transition-colors ${
                                                vistaPanel === t.id
                                                    ? "bg-white text-gray-900 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                            }`}
                                        >

                                            {t.label}

                                        </button>

                                    ))}

                                </div>


                                {vistaPanel === "historial" ? (

                                    <div className="h-[340px]">

                                        <TrazabilidadTimeline
                                            eventos={trazabilidad}
                                        />

                                    </div>

                                ) : (

                                    <>

                                        <h2 className="text-sm font-semibold text-gray-900">
                                            Revisión del informe
                                        </h2>


                                        {/* ESTADO TUTOR EMPRESARIAL */}

                                        <div className="flex flex-col gap-1">

                                            <div className="flex items-center justify-between">

                                                <span className="text-xs font-medium text-gray-500">
                                                    Tutor Empresarial
                                                </span>

                                                {renderBadgeEstadoRevision(
                                                    estadoTutorEmpresarial
                                                )}

                                            </div>

                                            {observacionTutorEmpresarial && (

                                                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5">
                                                    {observacionTutorEmpresarial}
                                                </p>

                                            )}

                                        </div>


                                        {/* ESTADO TUTOR DOCENTE */}

                                        <div className="flex flex-col gap-1">

                                            <div className="flex items-center justify-between">

                                                <span className="text-xs font-medium text-gray-500">
                                                    Tutor Docente
                                                </span>

                                                {renderBadgeEstadoRevision(
                                                    estadoTutorDocente
                                                )}

                                            </div>

                                            {observacionTutorDocente && (

                                                <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1.5">
                                                    {observacionTutorDocente}
                                                </p>

                                            )}

                                        </div>


                                        {/* AVISO DOCENTE */}

                                        {esTutorDocente &&
                                            !tutorEmpresarialAprobo &&
                                            !yaEvaluado && (

                                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                                                    Debes esperar a que el Tutor
                                                    Empresarial apruebe este
                                                    informe antes de poder
                                                    calificarlo.
                                                </div>

                                            )}


                                        {/* AVISO YA EVALUADO */}

                                        {yaEvaluado && (

                                            <div
                                                className={`text-xs rounded-lg px-3 py-2 border ${estadoPropio === ESTADO_APROBADO
                                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                                    : "text-red-700 bg-red-50 border-red-200"
                                                    }`}
                                            >

                                                {estadoPropio === ESTADO_APROBADO
                                                    ? "Ya aprobaste este informe. No puedes volver a calificarlo."
                                                    : "Ya rechazaste este informe. No puedes volver a calificarlo."
                                                }

                                            </div>

                                        )}


                                        {/* CONTROLES DE CALIFICACIÓN (no para el director) */}

                                        {!soloLectura ? (

                                            <>

                                                <div className="border-t border-gray-100" />

                                                {/* OBSERVACIÓN */}

                                                <div className="flex flex-col gap-1.5">

                                                    <label className="text-xs font-medium text-gray-500">

                                                        Observación{" "}

                                                        <span className="text-gray-400 font-normal">
                                                            (opcional)
                                                        </span>

                                                    </label>

                                                    <textarea
                                                        value={observacion}
                                                        onChange={(e) =>
                                                            setObservacion(e.target.value)
                                                        }
                                                        disabled={
                                                            !puedeCalificar ||
                                                            enviandoRevision
                                                        }
                                                        rows={4}
                                                        placeholder="Escribe aquí tu observación..."
                                                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 disabled:bg-gray-50 disabled:text-gray-400"
                                                    />

                                                </div>

                                                {/* ACCIONES */}

                                                <div className="flex flex-col gap-2 mt-auto">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirConfirmacion(ESTADO_APROBADO)
                                                        }
                                                        disabled={
                                                            !puedeCalificar ||
                                                            enviandoRevision
                                                        }
                                                        className="flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >

                                                        <CheckCircle2 className="w-4 h-4" />

                                                        Aprobar

                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            abrirConfirmacion(ESTADO_RECHAZADO)
                                                        }
                                                        disabled={
                                                            !puedeCalificar ||
                                                            enviandoRevision
                                                        }
                                                        className="flex items-center justify-center gap-2 text-sm font-medium rounded-lg px-3 py-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                    >

                                                        <XCircle className="w-4 h-4" />

                                                        Rechazar

                                                    </button>

                                                </div>

                                            </>

                                        ) : (

                                            <p className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                                Vista de consulta: puedes ver los comentarios
                                                de los tutores, pero no calificar.
                                            </p>

                                        )}

                                    </>

                                )}

                            </div>

                        </div>

                    </div>

                )}


                {/* ─────────────────────────────────────────
                    MODAL (solo si puede calificar)
                ───────────────────────────────────────── */}

                {!soloLectura && accionPendiente && (

                    <ConfirmModal
                        isOpen={modalAbierto}
                        title={configModal[accionPendiente].title}
                        message={configModal[accionPendiente].message}
                        confirmLabel={
                            enviandoRevision
                                ? "Guardando..."
                                : configModal[accionPendiente].confirmLabel
                        }
                        cancelLabel="Cancelar"
                        confirmColor={
                            configModal[accionPendiente].confirmColor
                        }
                        onConfirm={confirmarAccion}
                        onCancel={cerrarConfirmacion}
                        showTextarea={
                            configModal[accionPendiente].showTextarea
                        }
                        textareaLabel={
                            configModal[accionPendiente].textareaLabel
                        }
                        textareaValue={observacion}
                        onTextareaChange={setObservacion}
                        textareaPlaceholder="Escribe el motivo del rechazo..."
                    />

                )}

            </>

        </div>

    );

}