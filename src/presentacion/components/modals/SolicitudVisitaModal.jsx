
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
import ConfirmModal from "../modals/ConfirmModal";

const FECHA_VACIA = {
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: ""
};

const PASO_MIN = 60;
const HORA_MIN_DIA = 6;
const HORA_MAX_DIA = 20;

const HORAS_OPCIONES = (() => {
    const horas = [];

    for (let m = HORA_MIN_DIA * 60; m <= HORA_MAX_DIA * 60; m += PASO_MIN) {
        horas.push(
            `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
        );
    }

    return horas;
})();

const formatearHora = (hora) => {
    if (!hora) return "—";

    const [horas, minutos] = hora.split(":").map(Number);

    if (Number.isNaN(horas) || Number.isNaN(minutos)) {
        return hora;
    }

    const periodo = horas >= 12 ? "PM" : "AM";
    const horas12 = horas % 12 || 12;

    return `${horas12}:${String(minutos).padStart(2, "0")} ${periodo}`;
};

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

const tieneEmpresa = (practicante) => {
    const empresa = String(practicante?.empresa ?? "").trim().toLowerCase();

    return Boolean(empresa) && empresa !== "sin empresa";
};

const obtenerFechaHoy = () => {
    const d = new Date();
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const dia = String(d.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};

const normalizarFecha = (valor) => (valor ? String(valor).slice(0, 10) : "");
const normalizarHora = (valor) => (valor ? String(valor).slice(0, 5) : "");

const claveDisponibilidad = (f) =>
    [
        normalizarFecha(f.fecha_inicio),
        normalizarFecha(f.fecha_fin),
        normalizarHora(f.hora_inicio),
        normalizarHora(f.hora_fin)
    ].join("|");

const claseInput = (hayError) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
        hayError
            ? "border-red-500 bg-red-50 focus:ring-red-200"
            : "border-slate-300 focus:ring-red-200"
    }`;

const MensajeError = ({ mensaje }) =>
    mensaje ? <p className="text-xs text-red-600 mt-1">{mensaje}</p> : null;

const SolicitudVisitaModal = ({
    open,
    onClose,
    practicantes,
    onSubmit,
    enviando,
    idsConSolicitud,
    idsPracticantesNoSeleccionables,
    onGestionarVisita,
    onCancelarSolicitud
}) => {
    const [paso, setPaso] = useState(1);
    const [seleccionados, setSeleccionados] = useState([]);
    const [fechas, setFechas] = useState([{ ...FECHA_VACIA }]);
    const [fechasExistentes, setFechasExistentes] = useState([]);
    const [mostrarCancelacion, setMostrarCancelacion] = useState(false);
    const [motivoCancelacion, setMotivoCancelacion] = useState("");
    const [solicitudIdCancelacion, setSolicitudIdCancelacion] = useState(null);
    const [gestionandoVisitaId, setGestionandoVisitaId] = useState(null);

    useEffect(() => {
        if (open) {
            setPaso(1);
            setSeleccionados([]);
            setFechas([{ ...FECHA_VACIA }]);
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
            practicantes.reduce((grupos, practicante) => {
                const empresa = tieneEmpresa(practicante)
                    ? practicante.empresa
                    : "Sin empresa";

                if (!grupos[empresa]) {
                    grupos[empresa] = [];
                }

                grupos[empresa].push(practicante);

                return grupos;
            }, {}),
        [practicantes]
    );

    const practicantesSeleccionados = practicantes.filter((p) =>
        seleccionados.includes(p.id)
    );

    const empresaSeleccionada = practicantesSeleccionados[0]?.empresa || null;

    /*
     * ============================================================
     * VALIDACIÓN DE NUEVAS DISPONIBILIDADES
     * ============================================================
     */

    const hoy = obtenerFechaHoy();

    const erroresFechas = useMemo(() => {
        const hoyLocal = obtenerFechaHoy();

        const clavesExistentes = new Set(
            fechasExistentes.map(claveDisponibilidad)
        );

        const clavesNuevas = new Set();

        return fechas.map((f) => {
            const errores = {};

            if (f.fecha_inicio && f.fecha_inicio < hoyLocal) {
                errores.fecha_inicio =
                    "La fecha inicial no puede ser anterior a hoy.";
            }

            if (f.fecha_fin && f.fecha_fin < hoyLocal) {
                errores.fecha_fin =
                    "La fecha final no puede ser anterior a hoy.";
            } else if (
                f.fecha_inicio &&
                f.fecha_fin &&
                f.fecha_fin < f.fecha_inicio
            ) {
                errores.fecha_fin =
                    "La fecha final no puede ser anterior a la inicial.";
            }

            if (
                f.hora_inicio &&
                f.hora_fin &&
                f.hora_inicio >= f.hora_fin
            ) {
                errores.hora_fin =
                    "La hora final debe ser posterior a la inicial.";
            }

            const completa =
                f.fecha_inicio &&
                f.fecha_fin &&
                f.hora_inicio &&
                f.hora_fin;

            if (completa) {
                const clave = claveDisponibilidad(f);

                if (clavesExistentes.has(clave)) {
                    errores.duplicada =
                        "Esta disponibilidad ya fue propuesta (misma fecha y mismo horario).";
                } else if (clavesNuevas.has(clave)) {
                    errores.duplicada =
                        "Esta disponibilidad está repetida en otra de las nuevas (misma fecha y mismo horario).";
                } else {
                    clavesNuevas.add(clave);
                }
            }

            return errores;
        });
    }, [fechas, fechasExistentes]);

    const primerErrorFechas = () => {
        for (const errores of erroresFechas) {
            const mensajes = Object.values(errores);

            if (mensajes.length > 0) {
                return mensajes[0];
            }
        }

        return null;
    };

    /*
     * ============================================================
     * ESTADOS DE SOLICITUD
     * ============================================================
     */

    const esPendiente = (practicante) =>
        practicante.estadoSolicitudVisita === "Pendiente";

    const esAceptada = (practicante) =>
        practicante.estadoSolicitudVisita === "Aceptada";

    const esRechazada = (practicante) =>
        practicante.estadoSolicitudVisita === "Rechazada";

    const esCancelada = (practicante) =>
        practicante.estadoSolicitudVisita === "Cancelada";

    const tieneSolicitud = (practicante) => {
        return (
            practicante.estadoSolicitudVisita ||
            idsConSolicitud.has(practicante.id)
        );
    };

    const tieneSolicitudActiva = (practicante) => {
        if (esAceptada(practicante)) {
            return true;
        }

        if (
            !practicante.estadoSolicitudVisita &&
            idsConSolicitud.has(practicante.id)
        ) {
            return true;
        }

        return false;
    };

    const obtenerMotivoNoDisponible = (practicante) => {
        if (!tieneEmpresa(practicante)) {
            return "No disponible: el practicante no tiene una empresa asignada.";
        }

        switch (practicante.estado) {
            case "Retirado":
                return "No disponible: el practicante fue retirado de la práctica.";

            case "Finalizada":
                return "No disponible: la práctica del estudiante ya finalizó.";

            case "Cancelado":
                return "No disponible: la participación del practicante fue cancelada.";

            default:
                return "";
        }
    };

    /*
     * ============================================================
     * TOGGLE PRACTICANTE
     * ============================================================
     */

    const handleToggle = (practicante) => {
        const { id, empresa } = practicante;

        if (!tieneEmpresa(practicante)) {
            toast.error(
                "Este practicante no tiene empresa asignada, no se puede solicitar visita."
            );
            return;
        }

        if (
            idsPracticantesNoSeleccionables?.has(id) ||
            practicante.estado === "Retirado" ||
            practicante.estado === "Finalizada"
        ) {
            return;
        }

        if (esAceptada(practicante)) {
            return;
        }

        if (!practicante.estadoSolicitudVisita && idsConSolicitud.has(id)) {
            return;
        }

        if (seleccionados.includes(id)) {
            setSeleccionados((prev) => prev.filter((x) => x !== id));
            return;
        }

        if (empresaSeleccionada && empresaSeleccionada !== empresa) {
            toast.error(
                "Solo puede seleccionar practicantes de una empresa por solicitud."
            );
            return;
        }

        setSeleccionados((prev) => [...prev, id]);
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

        if (gestionandoVisitaId !== null) {
            return;
        }

        try {
            setGestionandoVisitaId(solicitudId);

            if (onGestionarVisita) {
                await onGestionarVisita({ solicitudId });
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

    const handleMostrarCancelacion = (practicante) => {
        if (!practicante?.solicitudVisitaId) {
            toast.error("No se encontró el ID de la solicitud.");
            return;
        }

        // La cancelación solamente está permitida para solicitudes pendientes.
        if (!esPendiente(practicante)) {
            return;
        }

        setSolicitudIdCancelacion(practicante.solicitudVisitaId);
        setMotivoCancelacion("");
        setMostrarCancelacion(true);
    };

    const cerrarCancelacion = () => {
        setMostrarCancelacion(false);
        setMotivoCancelacion("");
        setSolicitudIdCancelacion(null);
    };

    const handleCancelarSolicitud = async () => {
        if (!motivoCancelacion.trim()) {
            toast.error("Debes indicar el motivo de la cancelación.");
            return;
        }

        if (!solicitudIdCancelacion) {
            toast.error("No se encontró el ID de la solicitud.");
            return;
        }

        try {
            if (onCancelarSolicitud) {
                await onCancelarSolicitud({
                    solicitudId: solicitudIdCancelacion,
                    motivo: motivoCancelacion.trim()
                });
            }
        } catch (error) {
            console.error("Error al cancelar solicitud:", error);
        }
    };

    /*
     * ============================================================
     * CONTINUAR
     * ============================================================
     */

    const handleContinuar = () => {
        if (seleccionados.length === 0) {
            toast.error("Seleccione al menos un practicante.");
            return;
        }

        const practicantePrincipal = practicantes.find(
            (p) => p.id === seleccionados[0]
        );

        const fechasAnteriores = practicantePrincipal?.fechasPropuestas || [];

        setFechasExistentes(fechasAnteriores);
        setFechas([{ ...FECHA_VACIA }]);

        setPaso(2);
    };

    /*
     * ============================================================
     * AGREGAR FECHA NUEVA
     * ============================================================
     */

    const agregarFecha = () => {
        const ultimaFecha = fechas[fechas.length - 1];

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

        const error = primerErrorFechas();

        if (error) {
            toast.error(error);
            return;
        }

        setFechas((prev) => [...prev, { ...FECHA_VACIA }]);
    };

    /*
     * ============================================================
     * ELIMINAR FECHA NUEVA
     * ============================================================
     */

    const eliminarFecha = (index) => {
        setFechas((prev) => prev.filter((_, i) => i !== index));
    };

    /*
     * ============================================================
     * ACTUALIZAR FECHA NUEVA
     * ============================================================
     */

    const actualizarFecha = (index, campo, valor) => {
        setFechas((prev) =>
            prev.map((f, i) =>
                i === index ? { ...f, [campo]: valor } : f
            )
        );
    };

    /*
     * ============================================================
     * ENVIAR / EDITAR
     * ============================================================
     */

    const handleEnviar = async () => {
        const fechasCompletas = fechas.every(
            (f) =>
                f.fecha_inicio &&
                f.fecha_fin &&
                f.hora_inicio &&
                f.hora_fin
        );

        if (!fechasCompletas) {
            toast.error(
                "Complete las fechas y horarios de todas las nuevas disponibilidades."
            );
            return;
        }

        const error = primerErrorFechas();

        if (error) {
            toast.error(error);
            return;
        }

        const practicantePrincipal = practicantes.find(
            (p) => p.id === seleccionados[0]
        );

        const esEdicion =
            practicantePrincipal &&
            (
                esPendiente(practicantePrincipal) ||
                esRechazada(practicantePrincipal) ||
                esCancelada(practicantePrincipal)
            );

        const solicitudId = practicantePrincipal?.solicitudVisitaId || null;

        console.log("========== ENVIANDO SOLICITUD DE VISITA ==========");

        console.log({
            modo: esEdicion ? "EDITAR" : "CREAR",
            solicitudId,
            practicantes: seleccionados,
            fechasExistentes,
            fechasNuevas: fechas
        });

        console.log("===================================================");

        await onSubmit({
            solicitudId,
            editar: esEdicion,
            practicantes: seleccionados,
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
        <>
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                    {/* HEADER */}

                    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Solicitar visita
                            </h2>

                            <p className="text-sm text-slate-500">
                                {paso === 1
                                    ? "Seleccione los practicantes de una empresa"
                                    : empresaSeleccionada}
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={22} />
                        </button>
                    </div>

                    {/* BODY */}

                    <div className="px-6 py-5 overflow-y-auto flex-1">

                        {/* PASO 1 */}

                        {paso === 1 && (
                            <div className="space-y-6">
                                {Object.entries(empresasAgrupadas).map(
                                    ([empresa, practicantesEmpresa]) => (
                                        <div
                                            key={empresa}
                                            className="border border-slate-200 rounded-xl overflow-hidden"
                                        >
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                                <p className="font-semibold text-slate-700">
                                                    {empresa}

                                                    {empresa === "Sin empresa" && (
                                                        <span className="ml-2 text-xs font-normal text-slate-400">
                                                            (no se puede solicitar visita)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="divide-y divide-slate-100">
                                                {practicantesEmpresa.map((practicante) => {
                                                    const seleccionado =
                                                        seleccionados.includes(practicante.id);

                                                    const motivoNoDisponible =
                                                        obtenerMotivoNoDisponible(practicante);

                                                    const noSeleccionable =
                                                        Boolean(motivoNoDisponible);

                                                    const solicitudPendiente =
                                                        esPendiente(practicante);

                                                    const solicitudAceptada =
                                                        esAceptada(practicante);

                                                    const solicitudRechazada =
                                                        esRechazada(practicante);

                                                    const solicitudCancelada =
                                                        esCancelada(practicante);

                                                    const visitaRealizada =
                                                        Boolean(practicante.fechaRealizada);

                                                    const solicitudExiste =
                                                        tieneSolicitud(practicante);

                                                    const solicitudActiva =
                                                        tieneSolicitudActiva(practicante);

                                                    return (
                                                        <div
                                                            key={practicante.id}
                                                            className="px-4 py-3 flex items-start gap-3 transition-colors hover:bg-slate-50"
                                                        >
                                                            {/* CHECKBOX */}

                                                            {!noSeleccionable && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={seleccionado}
                                                                    disabled={solicitudActiva}
                                                                    onChange={() =>
                                                                        handleToggle(practicante)
                                                                    }
                                                                    title={
                                                                        solicitudActiva
                                                                            ? "Ya existe una solicitud de visita activa."
                                                                            : undefined
                                                                    }
                                                                    className={`h-4 w-4 shrink-0 mt-1 accent-red-600 ${
                                                                        solicitudActiva
                                                                            ? "cursor-not-allowed opacity-50"
                                                                            : "cursor-pointer"
                                                                    }`}
                                                                />
                                                            )}

                                                            <div
                                                                className={`flex-1 min-w-0 ${
                                                                    solicitudActiva || noSeleccionable
                                                                        ? "cursor-not-allowed opacity-60"
                                                                        : "cursor-pointer"
                                                                }`}
                                                                onClick={() => {
                                                                    if (
                                                                        !solicitudActiva &&
                                                                        !noSeleccionable
                                                                    ) {
                                                                        handleToggle(practicante);
                                                                    }
                                                                }}
                                                            >
                                                                {/* NOMBRE + ESTADO */}

                                                                <div className="flex items-start justify-between gap-3">
                                                                    <p className="text-sm font-medium text-slate-700">
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
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        Código: {practicante.codigo}
                                                                    </p>
                                                                )}

                                                                {/* PENDIENTE */}

                                                                {solicitudPendiente && (
                                                                    <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                                                                        <p className="text-xs font-semibold text-amber-700">
                                                                            Solicitud pendiente
                                                                        </p>

                                                                        <p className="text-xs text-amber-600 mt-1">
                                                                            Puede agregar nuevas disponibilidades o cancelar la solicitud.
                                                                        </p>

                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleMostrarCancelacion(practicante);
                                                                            }}
                                                                            className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                                                        >
                                                                            <Ban size={14} />
                                                                            Cancelar solicitud
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {/* ACEPTADA */}

                                                                {solicitudAceptada && (
                                                                    <div className="mt-2">
                                                                        <p className="text-xs text-green-600 mb-2">
                                                                            {visitaRealizada
                                                                                ? "La visita ya fue realizada."
                                                                                : "La solicitud de visita fue aceptada."}
                                                                        </p>

                                                                        {visitaRealizada && (
                                                                            <p className="text-xs text-slate-600 mb-2">
                                                                                Fecha de realización:{" "}
                                                                                {String(
                                                                                    practicante.fechaRealizada
                                                                                ).slice(0, 10)}
                                                                            </p>
                                                                        )}

                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                            {/* SOLO GESTIONAR VISITA */}

                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleGestionarVisita(practicante);
                                                                                }}
                                                                                disabled={
                                                                                    gestionandoVisitaId !== null ||
                                                                                    noSeleccionable
                                                                                }
                                                                                title={
                                                                                    noSeleccionable
                                                                                        ? motivoNoDisponible
                                                                                        : gestionandoVisitaId !== null
                                                                                            ? "Hay otra visita cargándose."
                                                                                            : "Gestionar visita"
                                                                                }
                                                                                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                                                                            >
                                                                                {gestionandoVisitaId ===
                                                                                practicante.solicitudVisitaId ? (
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
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* RECHAZADA */}

                                                                {solicitudRechazada && (
                                                                    <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                                                                        <p className="text-xs font-semibold text-red-700">
                                                                            Motivo del rechazo
                                                                        </p>

                                                                        {practicante.motivoSolicitudVisita ? (
                                                                            <p className="text-xs text-red-600 mt-1">
                                                                                {practicante.motivoSolicitudVisita}
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-xs text-red-600 mt-1">
                                                                                No se indicó un motivo.
                                                                            </p>
                                                                        )}

                                                                        <p className="text-xs text-blue-600 mt-2">
                                                                            Puede seleccionar nuevamente al practicante para agregar otra disponibilidad.
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* CANCELADA */}

                                                                {solicitudCancelada && (
                                                                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
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
                                                                        <p className="text-xs text-amber-600 mt-1">
                                                                            Ya tiene una solicitud de visita registrada.
                                                                        </p>
                                                                    )}

                                                                {/* NO DISPONIBLE */}

                                                                {noSeleccionable && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        {motivoNoDisponible}
                                                                    </p>
                                                                )}

                                                                {/* SIN SOLICITUD */}

                                                                {!noSeleccionable &&
                                                                    !solicitudExiste &&
                                                                    !practicante.estadoSolicitudVisita && (
                                                                        <p className="text-xs text-slate-400 mt-1">
                                                                            Sin solicitud de visita.
                                                                        </p>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* PASO 2 */}

                        {paso === 2 && (
                            <>
                                <p className="text-sm font-semibold text-slate-700 mb-3">
                                    Practicantes seleccionados
                                </p>

                                <div className="space-y-2 mb-6">
                                    {practicantesSeleccionados.map((practicante) => (
                                        <div
                                            key={practicante.id}
                                            className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">
                                                    {practicante.practicante || "Practicante"}
                                                </p>

                                                {practicante.codigo && (
                                                    <p className="text-xs text-slate-500">
                                                        Código: {practicante.codigo}
                                                    </p>
                                                )}
                                            </div>

                                            {practicante.estadoSolicitudVisita && (
                                                <EstadoBadge
                                                    estado={practicante.estadoSolicitudVisita}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* FECHAS EXISTENTES */}

                                {fechasExistentes.length > 0 && (
                                    <div className="mb-6">
                                        <div className="mb-3">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Disponibilidades existentes
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                Estas opciones ya fueron propuestas y no pueden modificarse.
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            {fechasExistentes.map((fecha, index) => (
                                                <div
                                                    key={fecha.id || index}
                                                    className="border border-slate-200 bg-slate-50 rounded-xl p-4"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            Opción {index + 1}
                                                        </p>

                                                        <span className="text-xs font-medium text-slate-500">
                                                            Existente
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                                                Fechas
                                                            </p>

                                                            <p className="text-sm text-slate-700">
                                                                {fecha.fecha_inicio || "—"}
                                                                {" → "}
                                                                {fecha.fecha_fin || "—"}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                                                Horario
                                                            </p>

                                                            <p className="text-sm text-slate-700">
                                                                {formatearHora(fecha.hora_inicio)}
                                                                {" → "}
                                                                {formatearHora(fecha.hora_fin)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* NUEVAS DISPONIBILIDADES */}

                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">
                                            {fechasExistentes.length > 0
                                                ? "Agregar nuevas disponibilidades"
                                                : "Disponibilidades propuestas"}
                                        </p>

                                        <p className="text-xs text-slate-500 mt-1">
                                            {fechasExistentes.length > 0
                                                ? "Las opciones anteriores no se pueden modificar. Puede agregar nuevas opciones."
                                                : "Indique los días y horarios en los que puede realizarse la visita."}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={agregarFecha}
                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <Plus size={16} />
                                        Agregar disponibilidad
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {fechas.map((fecha, index) => {
                                        const errores = erroresFechas[index] || {};

                                        return (
                                            <div
                                                key={index}
                                                className={`border rounded-xl p-4 bg-white ${
                                                    errores.duplicada
                                                        ? "border-red-500"
                                                        : "border-red-100"
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Nueva disponibilidad {index + 1}
                                                    </p>

                                                    {fechas.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => eliminarFecha(index)}
                                                            className="text-slate-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    )}
                                                </div>

                                                {errores.duplicada && (
                                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <p className="text-xs font-semibold text-red-700">
                                                            {errores.duplicada}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                            Rango de fechas
                                                        </p>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                    Fecha inicial
                                                                </label>

                                                                <input
                                                                    type="date"
                                                                    min={hoy}
                                                                    max="2099-12-31"
                                                                    value={fecha.fecha_inicio}
                                                                    onChange={(e) =>
                                                                        actualizarFecha(
                                                                            index,
                                                                            "fecha_inicio",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className={claseInput(
                                                                        Boolean(
                                                                            errores.fecha_inicio ||
                                                                            errores.duplicada
                                                                        )
                                                                    )}
                                                                />

                                                                <MensajeError
                                                                    mensaje={errores.fecha_inicio}
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                    Fecha final
                                                                </label>

                                                                <input
                                                                    type="date"
                                                                    value={fecha.fecha_fin}
                                                                    min={fecha.fecha_inicio || hoy}
                                                                    max="2099-12-31"
                                                                    onChange={(e) =>
                                                                        actualizarFecha(
                                                                            index,
                                                                            "fecha_fin",
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    className={claseInput(
                                                                        Boolean(
                                                                            errores.fecha_fin ||
                                                                            errores.duplicada
                                                                        )
                                                                    )}
                                                                />

                                                                <MensajeError
                                                                    mensaje={errores.fecha_fin}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                            Horario disponible
                                                        </p>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                Hora inicial
                                                            </label>

                                                            <select
                                                                value={fecha.hora_inicio}
                                                                onChange={(e) => {
                                                                    const nuevaHora = e.target.value;

                                                                    actualizarFecha(
                                                                        index,
                                                                        "hora_inicio",
                                                                        nuevaHora
                                                                    );

                                                                    if (
                                                                        fecha.hora_fin &&
                                                                        fecha.hora_fin <= nuevaHora
                                                                    ) {
                                                                        actualizarFecha(
                                                                            index,
                                                                            "hora_fin",
                                                                            ""
                                                                        );
                                                                    }
                                                                }}
                                                                className={claseInput(
                                                                    Boolean(errores.duplicada)
                                                                )}
                                                            >
                                                                <option value="">
                                                                    Selecciona una hora
                                                                </option>

                                                                {HORAS_OPCIONES.slice(0, -1).map((h) => (
                                                                    <option key={h} value={h}>
                                                                        {formatearHora(h)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                Hora final
                                                            </label>

                                                            <select
                                                                value={fecha.hora_fin}
                                                                disabled={!fecha.hora_inicio}
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "hora_fin",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className={`${claseInput(
                                                                    Boolean(
                                                                        errores.hora_fin ||
                                                                        errores.duplicada
                                                                    )
                                                                )} disabled:bg-slate-100 disabled:text-slate-400`}
                                                            >
                                                                <option value="">
                                                                    {fecha.hora_inicio
                                                                        ? "Selecciona una hora"
                                                                        : "Elige primero la hora inicial"}
                                                                </option>

                                                                {HORAS_OPCIONES.filter(
                                                                    (h) => h > fecha.hora_inicio
                                                                ).map((h) => (
                                                                    <option key={h} value={h}>
                                                                        {formatearHora(h)}
                                                                    </option>
                                                                ))}
                                                            </select>

                                                            <MensajeError
                                                                mensaje={errores.hora_fin}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    {/* FOOTER */}

                    <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">
                        {paso === 2 ? (
                            <button
                                type="button"
                                onClick={() => setPaso(1)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Atrás
                            </button>
                        ) : (
                            <p className="text-sm text-slate-500">
                                {seleccionados.length} seleccionado(s)
                            </p>
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Cerrar
                            </button>

                            {paso === 1 ? (
                                <button
                                    type="button"
                                    onClick={handleContinuar}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <CalendarDays size={16} />
                                    Continuar
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleEnviar}
                                    disabled={enviando}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                </div>
            </div>

            {/* MODAL DE CANCELACIÓN */}

            <ConfirmModal
                isOpen={mostrarCancelacion}
                title="Cancelar solicitud"
                message="Indique el motivo por el cual desea cancelar la solicitud de visita."
                confirmLabel="Confirmar cancelación"
                cancelLabel="Volver"
                onConfirm={handleCancelarSolicitud}
                onCancel={cerrarCancelacion}
                loading={enviando}
                showTextarea
                textareaLabel="Motivo de la cancelación"
                textareaValue={motivoCancelacion}
                onTextareaChange={setMotivoCancelacion}
                textareaPlaceholder="Escriba el motivo de la cancelación..."
            />
        </>
    );
};

export default SolicitudVisitaModal;
