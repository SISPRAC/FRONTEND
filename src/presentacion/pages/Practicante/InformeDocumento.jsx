import { useEffect, useState, useRef } from "react";

import { practicaRequisitoDocumentoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoRepository.js";
import { entregaInformeRepository } from "../../../infraestructura/repository/entregaInformeRepository.js";

import { obtenerInformesPracticanteVigentes } from "../../../aplicacion/practicaRequisitoDocumento/obtenerInformesPracticanteVigentes.js";
import { crearEntregaInforme } from "../../../aplicacion/entregaInforme/crearEntregaInforme.js";

// Componente y utilidad compartidos (ajusta la ruta a tu estructura)
import TrazabilidadTimeline from "../../components/Trazabilidadtimeline.jsx";
import { construirTrazabilidad } from "../../components/Construirtrazabilidad.jsx";

import {
    UploadCloud,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    Download,
    AlertTriangle,
    X,
} from "lucide-react";

import toast from "react-hot-toast";


// ---------------------------------------------------------------
// Formatear fecha
// ---------------------------------------------------------------

// Convierte "YYYY-MM-DD" (o ISO) a una fecha LOCAL a medianoche.
// Evita el desfase de un día que ocurre con new Date("2026-11-08") en UTC-5.
function parseFechaLocal(fecha) {

    if (!fecha) return null;

    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha));

    if (match) {
        return new Date(
            Number(match[1]),
            Number(match[2]) - 1,
            Number(match[3])
        );
    }

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) return null;

    date.setHours(0, 0, 0, 0);

    return date;
}

function formatearFechaCorta(fecha) {

    if (!fecha) return "—";

    const date = parseFechaLocal(fecha);

    if (!date) {
        return fecha;
    }

    return date.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}


// ---------------------------------------------------------------
// Estado de la fecha límite: "retrasada" | "por_vencer" | null
// ---------------------------------------------------------------

function obtenerEstadoFecha(fechaLimite) {

    const limite = parseFechaLocal(fechaLimite);

    if (!limite) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (hoy.getTime() > limite.getTime()) return "retrasada";
    if (hoy.getTime() === limite.getTime()) return "por_vencer";

    return null;
}


// ---------------------------------------------------------------
// ¿El informe es el plan de trabajo?
// ---------------------------------------------------------------

function esPlanDeTrabajoNombre(nombre) {

    return String(nombre || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/_/g, " ")
        .toLowerCase()
        .includes("plan de trabajo");
}


// ---------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------

const Bar = ({ className = "" }) => (
    <div className={`bg-slate-200 rounded ${className}`} />
);

function InformeDocumentoSkeleton() {

    return (

        <div
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse"
            role="status"
            aria-label="Cargando informe"
        >

            {/* COLUMNA IZQUIERDA */}

            <div className="flex flex-col gap-4">

                {/* Select */}
                <div>
                    <Bar className="h-3 w-24 mb-2" />
                    <Bar className="h-10 w-full rounded-xl" />
                </div>

                {/* Fechas */}
                <div>
                    <Bar className="h-4 w-32 mb-2" />
                    <div className="grid grid-cols-2 gap-3">
                        {[0, 1].map((i) => (
                            <div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                            >
                                <Bar className="h-3 w-16 mb-2" />
                                <Bar className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Formato / carga */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Bar className="h-4 w-28" />
                        <Bar className="h-3 w-32" />
                    </div>
                    <Bar className="h-32 w-full rounded-2xl" />
                </div>

                {/* Botón */}
                <Bar className="h-10 w-32 rounded-2xl mx-auto" />

            </div>


            {/* COLUMNA DERECHA */}

            <div className="flex flex-col gap-3">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="border border-slate-200 bg-slate-50 rounded-2xl px-3.5 py-3 flex items-center gap-3"
                        >
                            <Bar className="w-9 h-9 rounded-xl shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <Bar className="h-3 w-24" />
                                <Bar className="h-3 w-32" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-1">
                    <Bar className="h-4 w-24" />
                    <Bar className="h-3 w-16" />
                </div>

                {/* Timeline */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 h-[340px] flex flex-col gap-5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Bar className="w-3 h-3 rounded-full mt-1 shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <Bar className="h-3 w-1/3" />
                                <Bar className="h-3 w-full" />
                                <Bar className="h-3 w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>

            </div>

        </div>

    );

}


// ---------------------------------------------------------------
// Panel de estado
// ---------------------------------------------------------------

function EstadoPanel({
    estadoTutorDocente,
    estadoTutorEmpresarial
}) {

    const obtenerConfig = (estado, tipo) => {

        const title = tipo === "docente"
            ? "Tutor docente"
            : "Tutor empresarial";

        if (estado === "APROBADO") {
            return {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                iconBg: "bg-emerald-500",
                icon: <CheckCircle2 size={17} className="text-white" />,
                title,
                subtitle: "Documento aprobado",
                text: "text-emerald-700"
            };
        }

        if (estado === "RECHAZADO") {
            return {
                bg: "bg-red-50",
                border: "border-red-200",
                iconBg: "bg-red-500",
                icon: <XCircle size={17} className="text-white" />,
                title,
                subtitle: "Documento rechazado",
                text: "text-red-700"
            };
        }

        if (estado === "COMENTADO") {
            return {
                bg: "bg-slate-50",
                border: "border-slate-200",
                iconBg: "bg-slate-400",
                icon: <FileText size={17} className="text-white" />,
                title,
                subtitle: "Con observaciones",
                text: "text-slate-600"
            };
        }

        if (estado === "ACTUALIZADO") {
            return {
                bg: "bg-blue-50",
                border: "border-blue-200",
                iconBg: "bg-blue-500",
                icon: <UploadCloud size={17} className="text-white" />,
                title,
                subtitle: "Documento actualizado",
                text: "text-blue-700"
            };
        }

        if (estado === "VENCIDO") {
            return {
                bg: "bg-slate-100",
                border: "border-slate-300",
                iconBg: "bg-slate-500",
                icon: <Clock size={17} className="text-white" />,
                title,
                subtitle: "Documento vencido",
                text: "text-slate-600"
            };
        }

        return {
            bg: "bg-orange-50",
            border: "border-orange-200",
            iconBg: "bg-orange-400",
            icon: <Clock size={17} className="text-white" />,
            title,
            subtitle: "Esperando revisión",
            text: "text-orange-700"
        };
    };


    const docente =
        obtenerConfig(estadoTutorDocente || "PENDIENTE", "docente");

    const empresarial =
        obtenerConfig(estadoTutorEmpresarial || "PENDIENTE", "empresarial");


    return (

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div
                className={`${docente.bg} ${docente.border} border rounded-2xl px-3.5 py-3 flex items-center gap-3`}
            >

                <div
                    className={`${docente.iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}
                >
                    {docente.icon}
                </div>

                <div className="min-w-0">

                    <p className="text-xs font-bold text-slate-700">
                        {docente.title}
                    </p>

                    <p className={`text-xs font-semibold ${docente.text}`}>
                        {docente.subtitle}
                    </p>

                </div>

            </div>


            <div
                className={`${empresarial.bg} ${empresarial.border} border rounded-2xl px-3.5 py-3 flex items-center gap-3`}
            >

                <div
                    className={`${empresarial.iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}
                >
                    {empresarial.icon}
                </div>

                <div className="min-w-0">

                    <p className="text-xs font-bold text-slate-700">
                        {empresarial.title}
                    </p>

                    <p className={`text-xs font-semibold ${empresarial.text}`}>
                        {empresarial.subtitle}
                    </p>

                </div>

            </div>

        </div>

    );

}


// ---------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------

export default function InformeDocumento() {

    const fileInputRef = useRef(null);


    // CARGA INICIAL (solo la primera vez, para el skeleton)
    const [cargandoInicial, setCargandoInicial] = useState(true);

    // INFORMES VIGENTES
    const [tipos, setTipos] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    // ARCHIVO
    const [archivo, setArchivo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [enviando, setEnviando] = useState(false);

    // FECHAS
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    // ESTADOS DE LOS TUTORES
    const [estadoTutorDocente, setEstadoTutorDocente] =
        useState("PENDIENTE");
    const [estadoTutorEmpresarial, setEstadoTutorEmpresarial] =
        useState("PENDIENTE");

    // TRAZABILIDAD
    const [trazabilidad, setTrazabilidad] = useState([]);

    // DOCUMENTO ACTUAL
    const [documentoId, setDocumentoId] = useState(null);
    const [archivoActual, setArchivoActual] = useState(null);

    // PLAN DE TRABAJO: objetivo de la práctica
    const [objetivo, setObjetivo] = useState("");
    const [objetivoGuardado, setObjetivoGuardado] = useState("");

    const [errores, setErrores] = useState({
        archivo: false,
        objetivo: false,
    });


    // -----------------------------------------------------------
    // REGLAS DE EDICIÓN
    // -----------------------------------------------------------

    const tieneDocumento = Boolean(documentoId);

    const algunoRechazo =
        estadoTutorDocente === "RECHAZADO" ||
        estadoTutorEmpresarial === "RECHAZADO" ||
        estadoTutorDocente === "COMENTADO" ||
        estadoTutorEmpresarial === "COMENTADO";

    const documentoAprobadoPorAmbos =
        estadoTutorDocente === "APROBADO" &&
        estadoTutorEmpresarial === "APROBADO";

    const documentoBloqueado =
        documentoAprobadoPorAmbos ||
        estadoTutorDocente === "VENCIDO" ||
        estadoTutorEmpresarial === "VENCIDO";

    const puedeEditar =
        tieneDocumento &&
        algunoRechazo &&
        !documentoBloqueado;

    const esNuevoDocumento = !tieneDocumento;

    const tipoActual =
        tipos.find(
            (tipo) =>
                String(tipo.id) === String(tipoSeleccionado)
        );

    const esPlanDeTrabajo =
        esPlanDeTrabajoNombre(tipoActual?.tipoRequisitoDocumento?.nombre);

    // El texto solo se puede modificar al crear o cuando hay rechazo/comentario
    const puedeEditarTexto = esNuevoDocumento || puedeEditar;

    // Alerta de fecha: solo si aún falta que el practicante entregue/actualice
    const estadoFecha =
        (esNuevoDocumento || puedeEditar) && !documentoAprobadoPorAmbos
            ? obtenerEstadoFecha(fechaFin)
            : null;


    // -----------------------------------------------------------
    // CARGAR INFORMES VIGENTES
    // -----------------------------------------------------------

    useEffect(() => {

        cargarInformes();

        return () => {

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // -----------------------------------------------------------
    // CAMBIAR INFORME SELECCIONADO
    // -----------------------------------------------------------

    useEffect(() => {

        if (!tipoActual) {

            setFechaInicio(null);
            setFechaFin(null);

            setDocumentoId(null);
            setArchivoActual(null);

            setEstadoTutorDocente("PENDIENTE");
            setEstadoTutorEmpresarial("PENDIENTE");

            setTrazabilidad([]);

            setObjetivo("");
            setObjetivoGuardado("");

            return;
        }


        setFechaInicio(tipoActual.fecha_inicio);
        setFechaFin(tipoActual.fecha_limite);


        const entregas =
            Array.isArray(tipoActual.entregasInformes)
                ? tipoActual.entregasInformes
                : [];

        console.log("Entregas del informe seleccionado:", entregas);


        if (entregas.length === 0) {

            setDocumentoId(null);
            setArchivoActual(null);

            setEstadoTutorDocente("PENDIENTE");
            setEstadoTutorEmpresarial("PENDIENTE");

            setTrazabilidad([]);

            setArchivo(null);

            setObjetivo("");
            setObjetivoGuardado("");

            return;
        }


        // TOMAR LA ÚLTIMA VERSIÓN
        const entregasOrdenadas =
            [...entregas].sort(
                (a, b) =>
                    Number(a.version || 0) -
                    Number(b.version || 0)
            );

        const ultimaEntrega =
            entregasOrdenadas[entregasOrdenadas.length - 1];


        setDocumentoId(ultimaEntrega.id);

        setArchivoActual(
            ultimaEntrega.archivo?.url || null
        );

        setEstadoTutorDocente(
            ultimaEntrega.estado_tutor_docente || "PENDIENTE"
        );

        setEstadoTutorEmpresarial(
            ultimaEntrega.estado_tutor_empresarial || "PENDIENTE"
        );

        setArchivo(null);

        // Texto escrito en la última entrega del plan de trabajo
        const textoPrevio =
            ultimaEntrega.practicaPracticante?.objetivo ||
            tipoActual.objetivo ||
            "";

        setObjetivo(textoPrevio);
        setObjetivoGuardado(textoPrevio);


        // CONSTRUIR TRAZABILIDAD (función compartida)
        setTrazabilidad(
            construirTrazabilidad(entregasOrdenadas)
        );

    }, [tipoActual]);


    // -----------------------------------------------------------
    // OBTENER INFORMES
    // -----------------------------------------------------------

    const cargarInformes = async () => {

        try {

            const data =
                await obtenerInformesPracticanteVigentes({
                    practicaRequisitoDocumentoRepository
                });

            const informes = Array.isArray(data) ? data : [];

            console.log("Informes vigentes:", informes);

            setTipos(informes);


            setTipoSeleccionado((actual) => {
                const sigueExistiendo = informes.some(
                    (i) => String(i.id) === String(actual)
                );

                if (sigueExistiendo) return actual;

                return informes.length > 0 ? informes[0].id : null;
            });

        } catch (error) {

            console.error(
                "No se pudieron cargar los informes:",
                error
            );

            toast.error(
                "No se pudieron cargar los informes de la práctica"
            );

        } finally {

            setCargandoInicial(false);

        }

    };


    // -----------------------------------------------------------
    // ARCHIVO
    // -----------------------------------------------------------

    const setArchivoSeleccionado = (file) => {

        if (!file) return;

        if (file.type !== "application/pdf") {

            setErrores((prev) => ({
                ...prev,
                archivo: true,
            }));

            toast.error("El archivo debe ser un PDF");

            return;

        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setArchivo(file);

        setPreviewUrl(URL.createObjectURL(file));

        setErrores((prev) => ({
            ...prev,
            archivo: false,
        }));

    };


    const handleSelectFile = (e) => {

        const file = e.target.files?.[0];

        if (file) {
            setArchivoSeleccionado(file);
        }

    };


    const handleDrop = (e) => {

        e.preventDefault();

        if (documentoBloqueado) {
            return;
        }

        if (!esNuevoDocumento && !puedeEditar) {
            return;
        }

        const file = e.dataTransfer.files?.[0];

        if (file) {
            setArchivoSeleccionado(file);
        }

    };


    const handleQuitarArchivo = () => {

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setArchivo(null);
        setPreviewUrl(null);

        if (!tieneDocumento) {
            setErrores((prev) => ({
                ...prev,
                archivo: true,
            }));
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

    };


    const handleVerPreview = () => {

        if (!previewUrl) {
            return;
        }

        window.open(previewUrl, "_blank", "noopener,noreferrer");

    };


    const handleDescargarDocumento = (url) => {

        if (!url) {
            toast.error("Este documento no tiene archivo disponible");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");

    };


    // -----------------------------------------------------------
    // DESCARGAR FORMATO
    // -----------------------------------------------------------

    const handleDescargarFormato = () => {

        const url =
            tipoActual?.tipoRequisitoDocumento?.plantilla?.url;

        if (!url) {
            toast.error("Este informe no tiene un formato disponible");
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");

    };


    // -----------------------------------------------------------
    // VALIDAR
    // -----------------------------------------------------------

    const validarFormulario = () => {

        const nuevosErrores = {
            archivo: false,
            objetivo: false,
        };

        let valido = true;

        if (!archivo) {

            nuevosErrores.archivo = true;
            valido = false;

            toast.error("Selecciona un PDF antes de enviar");

        }

        if (esPlanDeTrabajo && !objetivo.trim()) {

            nuevosErrores.objetivo = true;
            valido = false;

            toast.error("Escribe el objetivo de la práctica antes de enviar");

        }

        setErrores(nuevosErrores);

        return valido;

    };


    // -----------------------------------------------------------
    // ENVIAR
    // -----------------------------------------------------------

    const handleEnviar = async () => {

        if (documentoAprobadoPorAmbos) {

            toast.error(
                "No puedes modificar un documento aprobado por ambos tutores"
            );

            return;

        }


        if (
            tieneDocumento &&
            !puedeEditar &&
            estadoTutorDocente !== "VENCIDO" &&
            estadoTutorEmpresarial !== "VENCIDO" &&
            estadoTutorDocente !== "RECHAZADO" &&
            estadoTutorEmpresarial !== "RECHAZADO" &&
            estadoTutorDocente !== "COMENTADO" &&
            estadoTutorEmpresarial !== "COMENTADO"
        ) {

            toast.error(
                "El documento solo puede actualizarse cuando uno de los tutores lo rechaza o lo comenta"
            );

            return;

        }


        if (!validarFormulario()) {
            return;
        }


        if (!tipoSeleccionado) {
            toast.error("Selecciona un tipo de informe");
            return;
        }


        try {

            setEnviando(true);

            const formData = new FormData();

            formData.append(
                "practica_requisito_documento_id",
                tipoSeleccionado
            );

            formData.append("archivo", archivo);

            if (esPlanDeTrabajo) {
                formData.append("objetivo", objetivo.trim());
            }

            await crearEntregaInforme(
                { entregaInformeRepository },
                formData
            );

            toast.success("Informe enviado correctamente");

            setArchivo(null);

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            setPreviewUrl(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setErrores({
                archivo: false,
                objetivo: false,
            });

            await cargarInformes();

        } catch (error) {

            console.error("No se pudo enviar el informe:", error);

            toast.error(
                error.response?.data?.message ||
                "No se pudo enviar el informe"
            );

        } finally {

            setEnviando(false);

        }

    };


    const textoBoton = enviando ? "Enviando..." : "Enviar";


    // -----------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------

    return (

        <div>

            {cargandoInicial ? (

                <div className="flex justify-center mb-5 animate-pulse">
                    <Bar className="h-7 w-56" />
                </div>

            ) : (

                <h1 className="text-[24px] font-extrabold text-slate-800 text-center mb-5 tracking-tight">

                    {tipoActual?.tipoRequisitoDocumento?.nombre || "Informe"}

                </h1>

            )}


            {cargandoInicial ? (

                <InformeDocumentoSkeleton />

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                    {/* ======================================================
                    COLUMNA IZQUIERDA
                ====================================================== */}

                    <div className="flex flex-col gap-4">


                        {/* SELECT DE INFORME */}

                        <div>

                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                                Tipo de informe
                            </label>

                            <select
                                value={tipoSeleccionado ?? ""}
                                onChange={(e) =>
                                    setTipoSeleccionado(e.target.value)
                                }
                                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-red-400 bg-white"
                            >

                                {tipos.length === 0 ? (

                                    <option value="">
                                        No hay informes vigentes
                                    </option>

                                ) : (

                                    tipos.map((tipo) => (

                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.tipoRequisitoDocumento?.nombre}
                                        </option>

                                    ))

                                )}

                            </select>

                        </div>


                        {/* FECHAS */}

                        <div>

                            <h2 className="text-sm font-bold text-slate-800 mb-2">
                                Fechas de entrega
                            </h2>

                            <div className="grid grid-cols-2 gap-3">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">
                                        Fecha inicio
                                    </p>

                                    <p className="text-sm font-bold text-slate-700">
                                        {formatearFechaCorta(fechaInicio)}
                                    </p>

                                </div>

                                <div
                                    className={`rounded-xl border px-3 py-2 ${estadoFecha === "retrasada"
                                        ? "border-red-300 bg-red-50"
                                        : estadoFecha === "por_vencer"
                                            ? "border-amber-300 bg-amber-50"
                                            : "border-slate-200 bg-slate-50"
                                        }`}
                                >

                                    <p className="text-xs font-semibold text-slate-500 mb-0.5">
                                        Fecha máxima
                                    </p>

                                    <p
                                        className={`text-sm font-bold ${estadoFecha === "retrasada"
                                            ? "text-red-700"
                                            : estadoFecha === "por_vencer"
                                                ? "text-amber-700"
                                                : "text-slate-700"
                                            }`}
                                    >
                                        {formatearFechaCorta(fechaFin)}
                                    </p>

                                </div>

                            </div>


                            {/* ALERTA DE FECHA */}

                            {estadoFecha === "retrasada" && (

                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">

                                    <AlertTriangle
                                        size={16}
                                        className="text-red-500 shrink-0"
                                    />

                                    <div>

                                        <p className="text-xs font-bold text-red-700">
                                            Entrega retrasada
                                        </p>

                                        <p className="text-[11px] text-red-600">
                                            La fecha máxima ya pasó. Entrega el documento lo antes posible.
                                        </p>

                                    </div>

                                </div>

                            )}

                            {estadoFecha === "por_vencer" && (

                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">

                                    <Clock
                                        size={16}
                                        className="text-amber-500 shrink-0"
                                    />

                                    <div>

                                        <p className="text-xs font-bold text-amber-700">
                                            Próximo a vencer
                                        </p>

                                        <p className="text-[11px] text-amber-600">
                                            Hoy es la fecha máxima de entrega.
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* PLAN DE TRABAJO: OBJETIVO DE LA PRÁCTICA */}

                        {esPlanDeTrabajo && (

                            <div>

                                <label
                                    htmlFor="objetivo-practica"
                                    className="block text-sm font-bold text-slate-800 mb-2"
                                >
                                    Objetivo de la práctica
                                </label>

                                <textarea
                                    id="objetivo-practica"
                                    value={objetivo}
                                    onChange={(e) => {
                                        setObjetivo(e.target.value);
                                        if (errores.objetivo) {
                                            setErrores((prev) => ({
                                                ...prev,
                                                objetivo: false,
                                            }));
                                        }
                                    }}
                                    disabled={!puedeEditarTexto}
                                    rows={4}
                                    placeholder={
                                        objetivoGuardado ||
                                        "Describe el objetivo que buscas alcanzar durante tu práctica..."
                                    }
                                    className={`w-full px-3 py-2 rounded-xl border text-sm text-slate-700 resize-none focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${errores.objetivo
                                        ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                                        : "border-slate-200 focus:border-red-400"
                                        }`}
                                />

                                {errores.objetivo && (

                                    <p className="text-[11px] text-red-500 mt-1">
                                        Debes escribir el objetivo de la práctica
                                    </p>

                                )}

                            </div>

                        )}


                        {/* CARGAR FORMATO */}

                        <div>

                            <div className="flex items-center justify-between mb-2">

                                <h2 className="text-sm font-bold text-slate-800">
                                    Cargar Formato
                                </h2>

                                <button
                                    onClick={handleDescargarFormato}
                                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                                >

                                    <Download size={13} />

                                    Descargar formato

                                </button>

                            </div>


                            {/* DOCUMENTO APROBADO POR AMBOS */}

                            {documentoAprobadoPorAmbos ? (

                                <div className="w-full h-32 border-2 border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center">

                                    <CheckCircle2
                                        size={24}
                                        className="text-emerald-500 mb-1"
                                    />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Documento aprobado
                                    </p>

                                    <p className="text-xs text-slate-400 text-center px-4">
                                        El tutor docente y el tutor empresarial aprobaron este documento.
                                    </p>

                                    {archivoActual && (

                                        <button
                                            onClick={() =>
                                                handleDescargarDocumento(archivoActual)
                                            }
                                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-1"
                                        >

                                            <Eye size={13} />

                                            Ver documento

                                        </button>

                                    )}

                                </div>

                            ) : estadoTutorDocente === "VENCIDO" ||
                                estadoTutorEmpresarial === "VENCIDO" ? (

                                /* DOCUMENTO VENCIDO */

                                <div className="w-full h-32 border-2 border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center px-6">

                                    <Clock
                                        size={24}
                                        className="text-slate-500 mb-1"
                                    />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Documento vencido
                                    </p>

                                    <p className="text-xs text-slate-400 text-center">
                                        Este documento no puede modificarse.
                                    </p>

                                </div>

                            ) : archivo ? (

                                /* ARCHIVO NUEVO SELECCIONADO */

                                <div className="w-full h-32 border-2 rounded-2xl bg-white flex flex-col items-center justify-center px-6 relative border-slate-200">

                                    <button
                                        onClick={handleQuitarArchivo}
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                                        title="Quitar archivo"
                                    >

                                        <X size={16} />

                                    </button>

                                    <FileText
                                        size={24}
                                        className="text-red-500 mb-1"
                                    />

                                    <p className="text-sm font-semibold text-slate-700 text-center truncate max-w-[220px]">
                                        {archivo.name}
                                    </p>

                                    <p className="text-xs text-slate-400 mb-1.5">
                                        {(archivo.size / 1024).toFixed(0)} KB
                                    </p>

                                    <button
                                        onClick={handleVerPreview}
                                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >

                                        <Eye size={13} />

                                        Ver

                                    </button>

                                </div>

                            ) : puedeEditar ? (

                                /* PUEDE EDITAR POR RECHAZO */

                                <div className="flex flex-col gap-2">

                                    {archivoActual && (

                                        <div className="w-full h-20 border border-red-200 rounded-2xl bg-red-50/40 flex items-center justify-between px-4">

                                            <div className="flex items-center gap-2 min-w-0">

                                                <FileText
                                                    size={22}
                                                    className="text-red-500 shrink-0"
                                                />

                                                <div className="min-w-0">

                                                    <p className="text-xs font-semibold text-slate-700">
                                                        Documento actual
                                                    </p>

                                                    <p className="text-[11px] text-slate-400 truncate">
                                                        Debes seleccionar un nuevo PDF para actualizarlo
                                                    </p>

                                                </div>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    handleDescargarDocumento(archivoActual)
                                                }
                                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 shrink-0"
                                            >

                                                <Eye size={13} />

                                                Ver

                                            </button>

                                        </div>

                                    )}

                                    <label
                                        htmlFor="documento-pdf"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl bg-white cursor-pointer transition-colors ${errores.archivo
                                            ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] bg-red-50/20"
                                            : "border-red-300 hover:bg-red-50/40"
                                            }`}
                                    >

                                        <UploadCloud
                                            size={24}
                                            className="text-slate-800 mb-1.5"
                                        />

                                        <span className="text-sm font-semibold text-slate-700">
                                            Seleccionar nuevo PDF
                                        </span>

                                        <span className="text-[11px] text-slate-400">
                                            Puedes actualizar porque uno de los tutores rechazó el informe
                                        </span>

                                        {errores.archivo && (

                                            <span className="text-[11px] text-red-500 mt-1">
                                                Debes seleccionar un archivo PDF
                                            </span>

                                        )}

                                        <input
                                            id="documento-pdf"
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={handleSelectFile}
                                        />

                                    </label>

                                </div>

                            ) : archivoActual ? (

                                /* DOCUMENTO EXISTENTE SIN PERMISO DE EDICIÓN */

                                <div className="w-full h-32 border-2 rounded-2xl bg-white flex flex-col items-center justify-center px-6 relative border-slate-200">

                                    <FileText
                                        size={24}
                                        className="text-red-500 mb-1"
                                    />

                                    <p className="text-sm font-semibold text-slate-700 text-center truncate max-w-[260px]">
                                        Documento actual
                                    </p>

                                    <p className="text-xs text-slate-400 mb-1.5 text-center">
                                        Solo puedes modificarlo si alguno de los tutores lo rechaza
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleDescargarDocumento(archivoActual)
                                        }
                                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >

                                        <Eye size={13} />

                                        Ver

                                    </button>

                                </div>

                            ) : (

                                /* SIN DOCUMENTO */

                                <label
                                    htmlFor="documento-pdf"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl bg-white cursor-pointer transition-colors ${errores.archivo
                                        ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] bg-red-50/20"
                                        : "border-red-300 hover:bg-red-50/40"
                                        }`}
                                >

                                    <UploadCloud
                                        size={24}
                                        className="text-slate-800 mb-1.5"
                                    />

                                    <span className="text-sm font-semibold text-slate-700">
                                        Cargar el PDF
                                    </span>

                                    {errores.archivo && (

                                        <span className="text-[11px] text-red-500 mt-1">
                                            Debes seleccionar un archivo PDF
                                        </span>

                                    )}

                                    <input
                                        id="documento-pdf"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={handleSelectFile}
                                    />

                                </label>

                            )}

                        </div>


                        {/* BOTÓN ENVIAR / ACTUALIZAR */}

                        <button
                            onClick={handleEnviar}
                            disabled={
                                enviando ||
                                documentoAprobadoPorAmbos ||
                                (tieneDocumento && !puedeEditar)
                            }
                            className="mx-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-7 py-2.5 rounded-2xl transition-colors"
                        >

                            <Send size={16} />

                            {textoBoton}

                        </button>


                        {/* MENSAJE CUANDO ESTÁ BLOQUEADO */}

                        {tieneDocumento &&
                            !puedeEditar &&
                            !documentoAprobadoPorAmbos &&
                            !(
                                estadoTutorDocente === "VENCIDO" ||
                                estadoTutorEmpresarial === "VENCIDO"
                            ) && (

                                <p className="text-center text-xs text-slate-400 -mt-2">

                                    El informe solo podrá actualizarse si el tutor
                                    docente o el tutor empresarial lo rechaza o lo comenta.

                                </p>

                            )}

                    </div>


                    {/* ======================================================
                    COLUMNA DERECHA
                ====================================================== */}

                    <div className="flex flex-col gap-3">

                        <EstadoPanel
                            estadoTutorDocente={estadoTutorDocente}
                            estadoTutorEmpresarial={estadoTutorEmpresarial}
                        />

                        <div className="flex items-center justify-between mt-1">

                            <h2 className="text-sm font-bold text-slate-800">
                                Trazabilidad
                            </h2>

                            {trazabilidad.length > 0 && (

                                <span className="text-[10px] font-semibold text-slate-400">
                                    {trazabilidad.length} movimiento{trazabilidad.length !== 1 ? "s" : ""}
                                </span>

                            )}

                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 h-[340px] overflow-hidden">

                            <TrazabilidadTimeline eventos={trazabilidad} />

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}