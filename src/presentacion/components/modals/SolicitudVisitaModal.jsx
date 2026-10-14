import { useState, useMemo, useEffect } from "react";
import {
    X,
    Plus,
    Send,
    ArrowLeft,
    CalendarDays,
    Ban,
    LoaderCircle
} from "lucide-react";
import toast from "react-hot-toast";
import EstadoBadge from "../estadoBadge/EstadoBadge";

const FECHA_VACIA = {
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: ""
};

const formatearHora = (hora) => {
    if (!hora) return "—";

    const [horas, minutos] = hora.split(":").map(Number);

    if (
        Number.isNaN(horas) ||
        Number.isNaN(minutos)
    ) {
        return hora;
    }

    const periodo = horas >= 12 ? "PM" : "AM";

    const horas12 = horas % 12 || 12;

    return `${horas12}:${String(minutos).padStart(2, "0")} ${periodo}`;
};

const SolicitudVisitaModal = ({
    open,
    onClose,
    practicantes = [],
    onSubmit,
    enviando = false,
    idsConSolicitud = new Set(),
    onGestionarVisita,
    onCancelarSolicitud
}) => {

    const [paso, setPaso] = useState(1);

    const [seleccionados, setSeleccionados] = useState([]);


    const [fechas, setFechas] = useState([
        { ...FECHA_VACIA }
    ]);


    const [fechasExistentes, setFechasExistentes] = useState([]);

    const [mostrarCancelacion, setMostrarCancelacion] =
        useState(false);

    const [motivoCancelacion, setMotivoCancelacion] =
        useState("");

    const [solicitudIdCancelacion, setSolicitudIdCancelacion] =
        useState(null);

    const [gestionandoVisitaId, setGestionandoVisitaId] = useState(null);

    useEffect(() => {

        if (open) {

            setPaso(1);

            setSeleccionados([]);

            setFechas([
                { ...FECHA_VACIA }
            ]);

            setFechasExistentes([]);

            setMostrarCancelacion(false);

            setMotivoCancelacion("");

            setSolicitudIdCancelacion(null);

        }

    }, [open]);


    /*
     * ============================================================
     * AGRUPAR POR EMPRESA
     * ============================================================
     */

    const empresasAgrupadas = useMemo(
        () =>
            practicantes.reduce(
                (grupos, practicante) => {

                    const empresa =
                        practicante.empresa ||
                        "Sin empresa";

                    if (!grupos[empresa]) {
                        grupos[empresa] = [];
                    }

                    grupos[empresa].push(
                        practicante
                    );

                    return grupos;

                },
                {}
            ),
        [practicantes]
    );


    const practicantesSeleccionados =
        practicantes.filter((p) =>
            seleccionados.includes(p.id)
        );


    const empresaSeleccionada =
        practicantesSeleccionados[0]?.empresa ||
        null;


    /*
     * ============================================================
     * ESTADOS DE SOLICITUD
     * ============================================================
     */

    const esPendiente = (practicante) =>
        practicante.estadoSolicitudVisita ===
        "Pendiente";


    const esAceptada = (practicante) =>
        practicante.estadoSolicitudVisita ===
        "Aceptada";


    const esRechazada = (practicante) =>
        practicante.estadoSolicitudVisita ===
        "Rechazada";

    const esCancelada = (practicante) =>
        practicante.estadoSolicitudVisita ===
        "Cancelada";


    const tieneSolicitud = (practicante) => {

        return (
            practicante.estadoSolicitudVisita ||
            idsConSolicitud.has(
                practicante.id
            )
        );

    };


    const tieneSolicitudActiva = (
        practicante
    ) => {

        /*
         * Aceptada no puede seleccionarse.
         */

        if (
            esAceptada(practicante)
        ) {

            return true;

        }


        /*
         * Si no hay estado pero existe en el Set,
         * bloqueamos por seguridad.
         */

        if (
            !practicante.estadoSolicitudVisita &&
            idsConSolicitud.has(
                practicante.id
            )
        ) {

            return true;

        }


        return false;

    };


    /*
     * ============================================================
     * TOGGLE PRACTICANTE
     * ============================================================
     */

    const handleToggle = (practicante) => {

        const {
            id,
            empresa
        } = practicante;


        /*
         * Aceptada no puede seleccionarse.
         */

        if (
            esAceptada(practicante)
        ) {

            return;

        }


        /*
         * Si existe una solicitud sin estado,
         * tampoco permitimos crear otra.
         */

        if (
            !practicante.estadoSolicitudVisita &&
            idsConSolicitud.has(id)
        ) {

            return;

        }


        /*
         * Si ya está seleccionado, quitarlo.
         */

        if (
            seleccionados.includes(id)
        ) {

            setSeleccionados((prev) =>
                prev.filter(
                    (x) => x !== id
                )
            );

            return;

        }


        /*
         * Solo una empresa por solicitud.
         */

        if (
            empresaSeleccionada &&
            empresaSeleccionada !== empresa
        ) {

            toast.error(
                "Solo puede seleccionar practicantes de una empresa por solicitud."
            );

            return;

        }


        setSeleccionados((prev) => [
            ...prev,
            id
        ]);

    };


    /*
     * ============================================================
     * GESTIONAR VISITA
     * ============================================================
     */

    const handleGestionarVisita = async (practicante) => {
        const solicitudId = practicante?.solicitudVisitaId;

        if (!solicitudId) {
            toast.error("No se encontró el ID de la solicitud.");
            return;
        }

        // Evitar múltiples clics mientras se procesa la acción.
        if (gestionandoVisitaId !== null) {
            return;
        }

        try {
            setGestionandoVisitaId(solicitudId);

            if (onGestionarVisita) {
                await onGestionarVisita({
                    solicitudId
                });
            }
        } catch (error) {
            console.error("Error al gestionar la visita:", error);
            toast.error("No fue posible abrir la visita.");
        } finally {
            setGestionandoVisitaId(null);
        }
    };


    /*
     * ============================================================
     * CANCELAR SOLICITUD
     * ============================================================
     */

    const handleMostrarCancelacion = (
        practicante
    ) => {

        if (
            !practicante?.solicitudVisitaId
        ) {

            toast.error(
                "No se encontró el ID de la solicitud."
            );

            return;

        }


        setSolicitudIdCancelacion(
            practicante.solicitudVisitaId
        );

        setMotivoCancelacion("");

        setMostrarCancelacion(true);

    };


    const handleCancelarSolicitud = async () => {

        if (
            !motivoCancelacion.trim()
        ) {

            toast.error(
                "Debes indicar el motivo de la cancelación."
            );

            return;

        }


        if (
            !solicitudIdCancelacion
        ) {

            toast.error(
                "No se encontró el ID de la solicitud."
            );

            return;

        }


        try {

            if (
                onCancelarSolicitud
            ) {

                await onCancelarSolicitud({

                    solicitudId:
                        solicitudIdCancelacion,

                    motivo:
                        motivoCancelacion.trim()

                });

            }

        } catch (error) {

            console.error(
                "Error al cancelar solicitud:",
                error
            );

        }

    };


    /*
     * ============================================================
     * CONTINUAR
     * ============================================================
     */

    const handleContinuar = () => {

        if (
            seleccionados.length === 0
        ) {

            toast.error(
                "Seleccione al menos un practicante."
            );

            return;

        }


        /*
         * Tomamos el primer practicante.
         *
         * Si es una solicitud existente, sus fechas
         * se mostrarán como solo lectura.
         */

        const practicantePrincipal =
            practicantes.find(
                (p) =>
                    p.id ===
                    seleccionados[0]
            );


        const fechasAnteriores =
            practicantePrincipal?.fechasPropuestas ||
            [];


        setFechasExistentes(
            fechasAnteriores
        );


        /*
         * Siempre iniciamos una nueva disponibilidad
         * para que el usuario pueda agregar otra opción.
         */

        setFechas([
            { ...FECHA_VACIA }
        ]);


        setPaso(2);

    };


    /*
     * ============================================================
     * AGREGAR FECHA NUEVA
     * ============================================================
     */

    const agregarFecha = () => {

        const ultimaFecha =
            fechas[
            fechas.length - 1
            ];


        if (
            !ultimaFecha.fecha_inicio ||
            !ultimaFecha.fecha_fin ||
            !ultimaFecha.hora_inicio ||
            !ultimaFecha.hora_fin
        ) {

            toast.error(
                "Complete la disponibilidad actual antes de agregar otra."
            );

            return;

        }


        if (
            ultimaFecha.fecha_inicio >
            ultimaFecha.fecha_fin
        ) {

            toast.error(
                "La fecha inicial no puede ser posterior a la fecha final."
            );

            return;

        }


        if (
            ultimaFecha.hora_inicio >=
            ultimaFecha.hora_fin
        ) {

            toast.error(
                "La hora inicial debe ser anterior a la hora final."
            );

            return;

        }


        setFechas((prev) => [
            ...prev,
            { ...FECHA_VACIA }
        ]);

    };


    /*
     * ============================================================
     * ELIMINAR FECHA NUEVA
     * ============================================================
     */

    const eliminarFecha = (
        index
    ) => {

        setFechas((prev) =>
            prev.filter(
                (_, i) =>
                    i !== index
            )
        );

    };


    /*
     * ============================================================
     * ACTUALIZAR FECHA NUEVA
     * ============================================================
     */

    const actualizarFecha = (
        index,
        campo,
        valor
    ) => {

        setFechas((prev) =>
            prev.map(
                (f, i) =>
                    i === index
                        ? {
                            ...f,
                            [campo]:
                                valor
                        }
                        : f
            )
        );

    };


    /*
     * ============================================================
     * ENVIAR / EDITAR
     * ============================================================
     */

    const handleEnviar = async () => {

        /*
         * Validamos únicamente las NUEVAS disponibilidades.
         *
         * Las anteriores ya están guardadas en la base de datos.
         */

        const fechasValidas =
            fechas.every(
                (f) =>
                    f.fecha_inicio &&
                    f.fecha_fin &&
                    f.hora_inicio &&
                    f.hora_fin
            );


        if (!fechasValidas) {

            toast.error(
                "Complete las fechas y horarios de todas las nuevas disponibilidades."
            );

            return;

        }


        const rangosValidos =
            fechas.every((f) => {

                return (
                    f.fecha_inicio <=
                    f.fecha_fin &&
                    f.hora_inicio <
                    f.hora_fin
                );

            });


        if (!rangosValidos) {

            toast.error(
                "Verifique que los rangos de fechas y horarios sean válidos."
            );

            return;

        }


        const practicantePrincipal =
            practicantes.find(
                (p) =>
                    p.id ===
                    seleccionados[0]
            );


        /*
         * Pendiente y Rechazada utilizan EDITAR.
         *
         * Sin solicitud utiliza CREAR.
         */

        const esEdicion =
            practicantePrincipal &&
            (
                esPendiente(
                    practicantePrincipal
                ) ||
                esRechazada(
                    practicantePrincipal
                ) || esCancelada(practicantePrincipal)
            );


        const solicitudId =
            practicantePrincipal
                ?.solicitudVisitaId ||
            null;


        console.log(
            "========== ENVIANDO SOLICITUD DE VISITA =========="
        );

        console.log({

            modo:
                esEdicion
                    ? "EDITAR"
                    : "CREAR",

            solicitudId,

            practicantes:
                seleccionados,

            fechasExistentes,

            fechasNuevas:
                fechas

        });

        console.log(
            "==================================================="
        );


        await onSubmit({

            solicitudId,

            editar:
                esEdicion,

            practicantes:
                seleccionados,

            /*
             * Solamente mandamos las nuevas fechas.
             *
             * Las anteriores ya existen en la BD y
             * no deben modificarse.
             */

            fechas

        });

    };


    /*
     * ============================================================
     * SI NO ESTÁ ABIERTO
     * ============================================================
     */

    if (!open) {

        return null;

    }


    return (

        <div
            className="
                fixed
                inset-0
                bg-black/40
                flex
                items-center
                justify-center
                z-50
                p-4
            "
        >

            <div
                className="
                    bg-white
                    rounded-xl
                    shadow-xl
                    w-full
                    max-w-2xl
                    max-h-[90vh]
                    flex
                    flex-col
                "
            >

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        px-6
                        py-4
                        border-b
                        border-slate-200
                    "
                >

                    <div>

                        <h2
                            className="
                                text-xl
                                font-bold
                                text-slate-800
                            "
                        >

                            Solicitar visita

                        </h2>


                        <p
                            className="
                                text-sm
                                text-slate-500
                            "
                        >

                            {paso === 1
                                ? "Seleccione los practicantes de una empresa"
                                : empresaSeleccionada}

                        </p>

                    </div>


                    <button
                        onClick={onClose}
                        className="
                            text-slate-400
                            hover:text-slate-600
                            transition-colors
                        "
                    >

                        <X size={22} />

                    </button>

                </div>


                {/* =====================================================
                    BODY
                ===================================================== */}

                <div
                    className="
                        px-6
                        py-5
                        overflow-y-auto
                        flex-1
                    "
                >

                    {/* =================================================
                        PASO 1
                    ================================================= */}

                    {paso === 1 && (

                        <div className="space-y-6">

                            {Object.entries(
                                empresasAgrupadas
                            ).map(
                                ([
                                    empresa,
                                    practicantesEmpresa
                                ]) => (

                                    <div
                                        key={empresa}
                                        className="
                                            border
                                            border-slate-200
                                            rounded-xl
                                            overflow-hidden
                                        "
                                    >

                                        <div
                                            className="
                                                bg-slate-50
                                                px-4
                                                py-3
                                                border-b
                                                border-slate-200
                                            "
                                        >

                                            <p
                                                className="
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                {empresa}

                                            </p>

                                        </div>


                                        <div
                                            className="
                                                divide-y
                                                divide-slate-100
                                            "
                                        >

                                            {practicantesEmpresa.map(
                                                (
                                                    practicante
                                                ) => {

                                                    const seleccionado =
                                                        seleccionados.includes(
                                                            practicante.id
                                                        );


                                                    const solicitudPendiente =
                                                        esPendiente(
                                                            practicante
                                                        );


                                                    const solicitudAceptada =
                                                        esAceptada(
                                                            practicante
                                                        );


                                                    const solicitudRechazada =
                                                        esRechazada(
                                                            practicante
                                                        );


                                                    const solicitudCancelada =
                                                        esCancelada(
                                                            practicante
                                                        );


                                                    // La fecha llega desde la consulta de la visita asociada.

                                                    const visitaRealizada = Boolean(
                                                        practicante.fechaRealizada
                                                    );



                                                    const solicitudExiste =
                                                        tieneSolicitud(
                                                            practicante
                                                        );


                                                    const solicitudActiva =
                                                        tieneSolicitudActiva(
                                                            practicante
                                                        );


                                                    return (

                                                        <div
                                                            key={
                                                                practicante.id
                                                            }
                                                            className="
                                                                px-4
                                                                py-3
                                                                flex
                                                                items-start
                                                                gap-3
                                                                transition-colors
                                                                hover:bg-slate-50
                                                            "
                                                        >

                                                            {/* CHECKBOX */}

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    seleccionado
                                                                }
                                                                disabled={
                                                                    solicitudActiva
                                                                }
                                                                onChange={() =>
                                                                    handleToggle(
                                                                        practicante
                                                                    )
                                                                }
                                                                className={`
                                                                    w-4
                                                                    h-4
                                                                    mt-1
                                                                    accent-red-600
                                                                    ${solicitudActiva
                                                                        ? "cursor-not-allowed"
                                                                        : "cursor-pointer"
                                                                    }
                                                                `}
                                                            />


                                                            <div
                                                                className={`
                                                                    flex-1
                                                                    min-w-0
                                                                    ${solicitudActiva
                                                                        ? "cursor-default"
                                                                        : "cursor-pointer"
                                                                    }
                                                                `}
                                                                onClick={() => {

                                                                    if (
                                                                        !solicitudActiva
                                                                    ) {

                                                                        handleToggle(
                                                                            practicante
                                                                        );

                                                                    }

                                                                }}
                                                            >

                                                                {/* NOMBRE + ESTADO */}

                                                                <div
                                                                    className="
                                                                        flex
                                                                        items-start
                                                                        justify-between
                                                                        gap-3
                                                                    "
                                                                >

                                                                    <p
                                                                        className="
                                                                            text-sm
                                                                            font-medium
                                                                            text-slate-700
                                                                        "
                                                                    >

                                                                        {practicante.practicante ||
                                                                            "Practicante"}

                                                                    </p>


                                                                    {practicante.estadoSolicitudVisita && (

                                                                        <EstadoBadge
                                                                            estado={
                                                                                practicante.estadoSolicitudVisita
                                                                            }
                                                                        />

                                                                    )}

                                                                </div>


                                                                {/* CODIGO */}

                                                                {practicante.codigo && (

                                                                    <p
                                                                        className="
                                                                            text-xs
                                                                            text-slate-500
                                                                            mt-1
                                                                        "
                                                                    >

                                                                        Código:{" "}
                                                                        {
                                                                            practicante.codigo
                                                                        }

                                                                    </p>

                                                                )}


                                                                {/* PENDIENTE */}

                                                                {solicitudPendiente && (

                                                                    <div
                                                                        className="
                                                                            mt-2
                                                                            p-3
                                                                            bg-amber-50
                                                                            border
                                                                            border-amber-100
                                                                            rounded-lg
                                                                        "
                                                                    >

                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                font-semibold
                                                                                text-amber-700
                                                                            "
                                                                        >

                                                                            Solicitud pendiente

                                                                        </p>


                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                text-amber-600
                                                                                mt-1
                                                                            "
                                                                        >

                                                                            Puede agregar nuevas disponibilidades o cancelar la solicitud.

                                                                        </p>


                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {

                                                                                e.stopPropagation();

                                                                                handleMostrarCancelacion(
                                                                                    practicante
                                                                                );

                                                                            }}
                                                                            className="
                                                                                mt-3
                                                                                inline-flex
                                                                                items-center
                                                                                gap-2
                                                                                px-3
                                                                                py-1.5
                                                                                text-xs
                                                                                font-medium
                                                                                text-red-600
                                                                                border
                                                                                border-red-200
                                                                                rounded-lg
                                                                                hover:bg-red-50
                                                                                transition-colors
                                                                            "
                                                                        >

                                                                            <Ban
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />

                                                                            Cancelar solicitud

                                                                        </button>

                                                                    </div>

                                                                )}


                                                                {/* ACEPTADA */}

                                                                {solicitudAceptada && (

                                                                    <div
                                                                        className="
                                                                            mt-2
                                                                        "
                                                                    >

                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                text-green-600
                                                                                mb-2
                                                                            "
                                                                        >

                                                                            {visitaRealizada
                                                                                ? "La visita ya fue realizada."
                                                                                : "La solicitud de visita fue aceptada."}

                                                                        </p>

                                                                        {visitaRealizada && (
                                                                            <p className="text-xs text-slate-600 mb-2">
                                                                                Fecha de realización:{" "}
                                                                                {String(practicante.fechaRealizada).slice(0, 10)}
                                                                            </p>
                                                                        )}



                                                                        <div
                                                                            className="
                                                                                flex
                                                                                flex-wrap
                                                                                items-center
                                                                                gap-2
                                                                            "
                                                                        >

                                                                            {/* GESTIONAR */}


                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleGestionarVisita(practicante);
                                                                                }}
                                                                                disabled={gestionandoVisitaId !== null}
                                                                                className="
        inline-flex
        items-center
        justify-center
        gap-2
        px-3
        py-1.5
        text-xs
        font-medium
        text-white
        bg-red-600
        rounded-lg
        hover:bg-red-700
        transition-colors
        disabled:opacity-70
        disabled:cursor-not-allowed
    "
                                                                            >
                                                                                {gestionandoVisitaId === practicante.solicitudVisitaId ? (
                                                                                    <>
                                                                                        <LoaderCircle
                                                                                            size={14}
                                                                                            className="animate-spin"
                                                                                        />
                                                                                        Cargando visita...
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <CalendarDays size={14} />
                                                                                        Gestionar visita
                                                                                    </>
                                                                                )}
                                                                            </button>



                                                                            {/* CANCELAR SOLO SI LA VISITA NO SE HA REALIZADO */}

                                                                            {!visitaRealizada && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {

                                                                                        e.stopPropagation();

                                                                                        handleMostrarCancelacion(
                                                                                            practicante
                                                                                        );

                                                                                    }}
                                                                                    className="
                                                                                        inline-flex
                                                                                        items-center
                                                                                        gap-2
                                                                                        px-3
                                                                                        py-1.5
                                                                                        text-xs
                                                                                        font-medium
                                                                                        text-red-600
                                                                                        border
                                                                                        border-red-200
                                                                                        rounded-lg
                                                                                        hover:bg-red-50
                                                                                        transition-colors
                                                                                    "
                                                                                >

                                                                                    <Ban size={14} />
                                                                                    Cancelar solicitud
                                                                                </button>
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}


                                                                {/* RECHAZADA */}

                                                                {solicitudRechazada && (

                                                                    <div
                                                                        className="
                                                                            mt-2
                                                                            p-3
                                                                            bg-red-50
                                                                            border
                                                                            border-red-100
                                                                            rounded-lg
                                                                        "
                                                                    >

                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                font-semibold
                                                                                text-red-700
                                                                            "
                                                                        >

                                                                            Motivo del rechazo

                                                                        </p>


                                                                        {practicante.motivoSolicitudVisita ? (

                                                                            <p
                                                                                className="
                                                                                    text-xs
                                                                                    text-red-600
                                                                                    mt-1
                                                                                "
                                                                            >

                                                                                {
                                                                                    practicante.motivoSolicitudVisita
                                                                                }

                                                                            </p>

                                                                        ) : (

                                                                            <p
                                                                                className="
                                                                                    text-xs
                                                                                    text-red-600
                                                                                    mt-1
                                                                                "
                                                                            >

                                                                                No se indicó un motivo.

                                                                            </p>

                                                                        )}


                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                text-blue-600
                                                                                mt-2
                                                                            "
                                                                        >

                                                                            Puede seleccionar nuevamente al practicante para agregar otra disponibilidad.

                                                                        </p>

                                                                    </div>

                                                                )}


                                                                {/* CANCELADA */}

                                                                {solicitudCancelada && (
                                                                    <div
                                                                        className="
                                                                            mt-2
                                                                            p-3
                                                                            bg-slate-50
                                                                            border
                                                                            border-slate-200
                                                                            rounded-lg
                                                                        "
                                                                    >
                                                                        <p className="text-xs font-semibold text-slate-700">
                                                                            Solicitud cancelada
                                                                        </p>

                                                                        <p className="text-xs text-slate-600 mt-1">
                                                                            Motivo de la cancelación
                                                                        </p>

                                                                        <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                                                                            {practicante.motivoSolicitudVisita ||
                                                                                "No se indicó un motivo de cancelación."}
                                                                        </p>

                                                                        <p className="text-xs text-blue-600 mt-2">
                                                                            Puede seleccionar nuevamente al practicante para proponer otra solicitud.
                                                                        </p>
                                                                    </div>
                                                                )}


                                                                {/* SOLICITUD EXISTENTE SIN ESTADO */}

                                                                {!practicante.estadoSolicitudVisita &&
                                                                    solicitudExiste && (

                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                text-amber-600
                                                                                mt-1
                                                                            "
                                                                        >

                                                                            Ya tiene una solicitud de visita registrada.

                                                                        </p>

                                                                    )}


                                                                {/* SIN SOLICITUD */}

                                                                {!solicitudExiste &&
                                                                    !practicante.estadoSolicitudVisita && (

                                                                        <p
                                                                            className="
                                                                                text-xs
                                                                                text-slate-400
                                                                                mt-1
                                                                            "
                                                                        >

                                                                            Sin solicitud de visita.

                                                                        </p>

                                                                    )}

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}


                    {/* =================================================
                        PASO 2
                    ================================================= */}

                    {paso === 2 && (

                        <>

                            {/* PRACTICANTES */}

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    mb-3
                                "
                            >

                                Practicantes seleccionados

                            </p>


                            <div
                                className="
                                    space-y-2
                                    mb-6
                                "
                            >

                                {practicantesSeleccionados.map(
                                    (practicante) => (

                                        <div
                                            key={
                                                practicante.id
                                            }
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                bg-slate-50
                                                border
                                                border-slate-200
                                                rounded-lg
                                                px-4
                                                py-3
                                            "
                                        >

                                            <div>

                                                <p
                                                    className="
                                                        text-sm
                                                        font-medium
                                                        text-slate-700
                                                    "
                                                >

                                                    {practicante.practicante ||
                                                        "Practicante"}

                                                </p>


                                                {practicante.codigo && (

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-slate-500
                                                        "
                                                    >

                                                        Código:{" "}
                                                        {
                                                            practicante.codigo
                                                        }

                                                    </p>

                                                )}

                                            </div>


                                            {practicante.estadoSolicitudVisita && (

                                                <EstadoBadge
                                                    estado={
                                                        practicante.estadoSolicitudVisita
                                                    }
                                                />

                                            )}

                                        </div>

                                    )
                                )}

                            </div>


                            {/* =================================================
                                FECHAS EXISTENTES
                            ================================================= */}

                            {fechasExistentes.length > 0 && (

                                <div
                                    className="
                                        mb-6
                                    "
                                >

                                    <div
                                        className="
                                            mb-3
                                        "
                                    >

                                        <p
                                            className="
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                            "
                                        >

                                            Disponibilidades existentes

                                        </p>


                                        <p
                                            className="
                                                text-xs
                                                text-slate-500
                                                mt-1
                                            "
                                        >

                                            Estas opciones ya fueron propuestas y no pueden modificarse.

                                        </p>

                                    </div>


                                    <div
                                        className="
                                            space-y-3
                                        "
                                    >

                                        {fechasExistentes.map(
                                            (
                                                fecha,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        fecha.id ||
                                                        index
                                                    }
                                                    className="
                                                        border
                                                        border-slate-200
                                                        bg-slate-50
                                                        rounded-xl
                                                        p-4
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            justify-between
                                                            mb-3
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-slate-700
                                                            "
                                                        >

                                                            Opción{" "}
                                                            {
                                                                index + 1
                                                            }

                                                        </p>


                                                        <span
                                                            className="
                                                                text-xs
                                                                font-medium
                                                                text-slate-500
                                                            "
                                                        >

                                                            Existente

                                                        </span>

                                                    </div>


                                                    <div
                                                        className="
                                                            grid
                                                            grid-cols-1
                                                            md:grid-cols-2
                                                            gap-4
                                                        "
                                                    >

                                                        <div>

                                                            <p
                                                                className="
                                                                    text-xs
                                                                    font-semibold
                                                                    text-slate-500
                                                                    uppercase
                                                                    tracking-wide
                                                                    mb-1
                                                                "
                                                            >

                                                                Fechas

                                                            </p>


                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-slate-700
                                                                "
                                                            >

                                                                {fecha.fecha_inicio ||
                                                                    "—"}

                                                                {" → "}

                                                                {fecha.fecha_fin ||
                                                                    "—"}

                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p
                                                                className="
                                                                    text-xs
                                                                    font-semibold
                                                                    text-slate-500
                                                                    uppercase
                                                                    tracking-wide
                                                                    mb-1
                                                                "
                                                            >

                                                                Horario

                                                            </p>


                                                            <p
                                                                className="
                                                                    text-sm
                                                                    text-slate-700
                                                                "
                                                            >

                                                                {formatearHora(fecha.hora_inicio)}

                                                                {" → "}

                                                                {formatearHora(fecha.hora_fin)}


                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                </div>

                            )}


                            {/* =================================================
                                NUEVAS DISPONIBILIDADES
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    justify-between
                                    items-center
                                    mb-3
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            font-semibold
                                            text-slate-700
                                        "
                                    >

                                        {fechasExistentes.length > 0
                                            ? "Agregar nuevas disponibilidades"
                                            : "Disponibilidades propuestas"}

                                    </p>


                                    <p
                                        className="
                                            text-xs
                                            text-slate-500
                                            mt-1
                                        "
                                    >

                                        {fechasExistentes.length > 0
                                            ? "Las opciones anteriores no se pueden modificar. Puede agregar nuevas opciones."
                                            : "Indique los días y horarios en los que puede realizarse la visita."}

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        agregarFecha
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        text-red-600
                                        border
                                        border-red-200
                                        rounded-lg
                                        hover:bg-red-50
                                        transition-colors
                                    "
                                >

                                    <Plus size={16} />

                                    Agregar disponibilidad

                                </button>

                            </div>


                            <div
                                className="
                                    space-y-4
                                "
                            >

                                {fechas.map(
                                    (
                                        fecha,
                                        index
                                    ) => (

                                        <div
                                            key={index}
                                            className="
                                                border
                                                border-red-100
                                                rounded-xl
                                                p-4
                                                bg-white
                                            "
                                        >

                                            {/* CABECERA */}

                                            <div
                                                className="
                                                    flex
                                                    justify-between
                                                    items-center
                                                    mb-4
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-semibold
                                                            text-slate-700
                                                        "
                                                    >

                                                        Nueva disponibilidad{" "}
                                                        {
                                                            index + 1
                                                        }

                                                    </p>

                                                </div>


                                                {fechas.length > 1 && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            eliminarFecha(
                                                                index
                                                            )
                                                        }
                                                        className="
                                                            text-slate-400
                                                            hover:text-red-600
                                                            transition-colors
                                                        "
                                                    >

                                                        <X size={18} />

                                                    </button>

                                                )}

                                            </div>


                                            {/* RANGO DE FECHAS */}

                                            <div
                                                className="
                                                    space-y-4
                                                "
                                            >

                                                <div>

                                                    <p
                                                        className="
                                                            text-xs
                                                            font-semibold
                                                            text-slate-500
                                                            uppercase
                                                            tracking-wide
                                                            mb-2
                                                        "
                                                    >

                                                        Rango de fechas

                                                    </p>


                                                    <div
                                                        className="
                                                            grid
                                                            grid-cols-1
                                                            md:grid-cols-2
                                                            gap-4
                                                        "
                                                    >

                                                        {/* FECHA INICIAL */}

                                                        <div>

                                                            <label
                                                                className="
                                                                    block
                                                                    text-xs
                                                                    font-medium
                                                                    text-slate-500
                                                                    mb-1
                                                                "
                                                            >

                                                                Fecha inicial

                                                            </label>


                                                            <input
                                                                type="date"
                                                                min="1900-01-01"
                                                                max="2099-12-31"
                                                                value={
                                                                    fecha.fecha_inicio
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "fecha_inicio",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    border
                                                                    border-slate-300
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    focus:outline-none
                                                                    focus:ring-2
                                                                    focus:ring-red-200
                                                                "
                                                            />

                                                        </div>


                                                        {/* FECHA FINAL */}

                                                        <div>

                                                            <label
                                                                className="
                                                                    block
                                                                    text-xs
                                                                    font-medium
                                                                    text-slate-500
                                                                    mb-1
                                                                "
                                                            >

                                                                Fecha final

                                                            </label>


                                                            <input
                                                                type="date"
                                                                value={
                                                                    fecha.fecha_fin
                                                                }
                                                                min={
                                                                    fecha.fecha_inicio ||
                                                                    undefined
                                                                }
                                                                max="2099-12-31"
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "fecha_fin",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    border
                                                                    border-slate-300
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    focus:outline-none
                                                                    focus:ring-2
                                                                    focus:ring-red-200
                                                                "
                                                            />

                                                        </div>

                                                    </div>

                                                </div>


                                                {/* HORARIO */}

                                                <div>

                                                    <p
                                                        className="
                                                            text-xs
                                                            font-semibold
                                                            text-slate-500
                                                            uppercase
                                                            tracking-wide
                                                            mb-2
                                                        "
                                                    >

                                                        Horario disponible

                                                    </p>


                                                    <div
                                                        className="
                                                            grid
                                                            grid-cols-1
                                                            md:grid-cols-2
                                                            gap-4
                                                        "
                                                    >

                                                        {/* HORA INICIAL */}

                                                        <div>

                                                            <label
                                                                className="
                                                                    block
                                                                    text-xs
                                                                    font-medium
                                                                    text-slate-500
                                                                    mb-1
                                                                "
                                                            >

                                                                Hora inicial

                                                            </label>


                                                            <input
                                                                type="time"
                                                                value={
                                                                    fecha.hora_inicio
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "hora_inicio",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    border
                                                                    border-slate-300
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    focus:outline-none
                                                                    focus:ring-2
                                                                    focus:ring-red-200
                                                                "
                                                            />

                                                        </div>


                                                        {/* HORA FINAL */}

                                                        <div>

                                                            <label
                                                                className="
                                                                    block
                                                                    text-xs
                                                                    font-medium
                                                                    text-slate-500
                                                                    mb-1
                                                                "
                                                            >

                                                                Hora final

                                                            </label>


                                                            <input
                                                                type="time"
                                                                value={
                                                                    fecha.hora_fin
                                                                }
                                                                min={
                                                                    fecha.hora_inicio ||
                                                                    undefined
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "hora_fin",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="
                                                                    w-full
                                                                    border
                                                                    border-slate-300
                                                                    rounded-lg
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    focus:outline-none
                                                                    focus:ring-2
                                                                    focus:ring-red-200
                                                                "
                                                            />

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </>

                    )}

                </div>


                {/* =====================================================
                    FOOTER
                ===================================================== */}

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        px-6
                        py-4
                        border-t
                        border-slate-200
                    "
                >

                    {paso === 2 ? (

                        <button
                            type="button"
                            onClick={() =>
                                setPaso(1)
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-slate-600
                                hover:text-slate-800
                                transition-colors
                            "
                        >

                            <ArrowLeft size={16} />

                            Atrás

                        </button>

                    ) : (

                        <p
                            className="
                                text-sm
                                text-slate-500
                            "
                        >

                            {seleccionados.length}
                            {" "}
                            seleccionado(s)

                        </p>

                    )}


                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-4
                                py-2
                                text-sm
                                font-medium
                                text-slate-600
                                border
                                border-slate-300
                                rounded-lg
                                hover:bg-slate-50
                                transition-colors
                            "
                        >

                            Cerrar

                        </button>


                        {paso === 1 ? (

                            <button
                                type="button"
                                onClick={
                                    handleContinuar
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    bg-red-600
                                    text-white
                                    text-sm
                                    font-medium
                                    rounded-lg
                                    hover:bg-red-700
                                    transition-colors
                                "
                            >

                                <CalendarDays size={16} />

                                Continuar

                            </button>

                        ) : (

                            <button
                                type="button"
                                onClick={
                                    handleEnviar
                                }
                                disabled={
                                    enviando
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    bg-red-600
                                    text-white
                                    text-sm
                                    font-medium
                                    rounded-lg
                                    hover:bg-red-700
                                    transition-colors
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >

                                <Send size={16} />

                                {enviando
                                    ? "Guardando..."
                                    : fechasExistentes.length > 0
                                        ? "Agregar opciones"
                                        : "Enviar solicitud"}

                            </button>

                        )}

                    </div>

                </div>


                {/* =====================================================
                    MODAL DE CANCELACIÓN
                ===================================================== */}

                {mostrarCancelacion && (

                    <div
                        className="
                            absolute
                            inset-0
                            bg-black/40
                            flex
                            items-center
                            justify-center
                            p-4
                            rounded-xl
                        "
                    >

                        <div
                            className="
                                bg-white
                                rounded-xl
                                shadow-xl
                                w-full
                                max-w-md
                                p-6
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    justify-between
                                    mb-4
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            text-lg
                                            font-bold
                                            text-slate-800
                                        "
                                    >

                                        Cancelar solicitud

                                    </h3>


                                    <p
                                        className="
                                            text-sm
                                            text-slate-500
                                            mt-1
                                        "
                                    >

                                        Indique el motivo por el cual desea cancelar la solicitud de visita.

                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setMostrarCancelacion(
                                            false
                                        )
                                    }
                                    className="
                                        text-slate-400
                                        hover:text-slate-600
                                    "
                                >

                                    <X size={20} />

                                </button>

                            </div>


                            <textarea
                                value={
                                    motivoCancelacion
                                }
                                onChange={(e) =>
                                    setMotivoCancelacion(
                                        e.target.value
                                    )
                                }
                                placeholder="Escriba el motivo de la cancelación..."
                                rows={4}
                                className="
                                    w-full
                                    border
                                    border-slate-300
                                    rounded-lg
                                    px-3
                                    py-2
                                    text-sm
                                    resize-none
                                    focus:outline-none
                                    focus:ring-2
                                    focus:ring-red-200
                                "
                            />


                            <div
                                className="
                                    flex
                                    justify-end
                                    gap-3
                                    mt-4
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() => {

                                        setMostrarCancelacion(
                                            false
                                        );

                                        setMotivoCancelacion("");

                                        setSolicitudIdCancelacion(
                                            null
                                        );

                                    }}
                                    className="
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        text-slate-600
                                        border
                                        border-slate-300
                                        rounded-lg
                                        hover:bg-slate-50
                                    "
                                >

                                    Volver

                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleCancelarSolicitud
                                    }
                                    disabled={
                                        enviando
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        bg-red-600
                                        rounded-lg
                                        hover:bg-red-700
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >

                                    <Ban size={16} />

                                    {enviando
                                        ? "Cancelando..."
                                        : "Confirmar cancelación"}

                                </button>

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </div>

    );

};


export default SolicitudVisitaModal;
