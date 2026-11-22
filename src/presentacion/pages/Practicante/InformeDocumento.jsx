
import { useEffect, useState, useRef } from "react";

import { practicaRequisitoDocumentoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoRepository.js";
import { entregaInformeRepository } from "../../../infraestructura/repository/entregaInformeRepository.js";

import { obtenerInformesPracticanteVigentes } from "../../../aplicacion/practicaRequisitoDocumento/obtenerInformesPracticanteVigentes.js";
import { crearEntregaInforme } from "../../../aplicacion/entregaInforme/crearEntregaInforme.js";

import TrazabilidadTimeline from "../../components/Trazabilidadtimeline.jsx";
import { construirTrazabilidad } from "../../components/Construirtrazabilidad.jsx";

import VisorPdfModal from "../../components/modals/VisorPdfModal.jsx";
import { descargarArchivo } from "../../components/utils/descargarArchivo.js";

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
    Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

// ---------------------------------------------------------------
// CONSTANTES
// ---------------------------------------------------------------

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB


// ---------------------------------------------------------------
// FORMATEAR FECHA
// ---------------------------------------------------------------

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

    if (!date) return fecha;

    return date.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}


// ---------------------------------------------------------------
// ESTADO DE LA FECHA LÍMITE
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
// ¿EL INFORME ES EL PLAN DE TRABAJO?
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
// SKELETON
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
            <div className="flex flex-col gap-4">

                <div>
                    <Bar className="h-3 w-24 mb-2" />
                    <Bar className="h-10 w-full rounded-xl" />
                </div>

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

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Bar className="h-4 w-28" />
                        <Bar className="h-3 w-32" />
                    </div>
                    <Bar className="h-32 w-full rounded-2xl" />
                </div>

                <Bar className="h-10 w-32 rounded-2xl mx-auto" />
            </div>

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
// PANEL DE ESTADO
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
                bg: "bg-red-100",
                border: "border-red-300",
                iconBg: "bg-red-500",
                icon: <Clock size={17} className="text-white" />,
                title,
                subtitle: "Documento vencido",
                text: "text-red-600"
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

    const docente = obtenerConfig(
        estadoTutorDocente || "PENDIENTE",
        "docente"
    );

    const empresarial = obtenerConfig(
        estadoTutorEmpresarial || "PENDIENTE",
        "empresarial"
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <div className={`${docente.bg} ${docente.border} border rounded-2xl px-3.5 py-3 flex items-center gap-3`}>
                <div className={`${docente.iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
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

            <div className={`${empresarial.bg} ${empresarial.border} border rounded-2xl px-3.5 py-3 flex items-center gap-3`}>
                <div className={`${empresarial.iconBg} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
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
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------

export default function InformeDocumento() {

    const fileInputRef = useRef(null);

    const [cargandoInicial, setCargandoInicial] = useState(true);

    const [tipos, setTipos] = useState([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

    const [archivo, setArchivo] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [visor, setVisor] = useState(null);
    const [descargandoFormato, setDescargandoFormato] = useState(false);

    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);

    const [estadoTutorDocente, setEstadoTutorDocente] = useState("PENDIENTE");
    const [estadoTutorEmpresarial, setEstadoTutorEmpresarial] = useState("PENDIENTE");

    const [trazabilidad, setTrazabilidad] = useState([]);

    const [documentoId, setDocumentoId] = useState(null);
    const [archivoActual, setArchivoActual] = useState(null);

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

    const tipoActual = tipos.find(
        (tipo) => String(tipo.id) === String(tipoSeleccionado)
    );

    const nombreInforme =
        tipoActual?.tipoRequisitoDocumento?.nombre || "Informe";

    const esPlanDeTrabajo = esPlanDeTrabajoNombre(
        tipoActual?.tipoRequisitoDocumento?.nombre
    );

    const puedeEditarTexto = esNuevoDocumento || puedeEditar;

    const estadoFecha =
        (esNuevoDocumento || puedeEditar) && !documentoAprobadoPorAmbos
            ? obtenerEstadoFecha(fechaFin)
            : null;

    const bloqueadoPorFecha = estadoFecha === "retrasada";


    // -----------------------------------------------------------
    // CARGA INICIAL
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

        const entregas = Array.isArray(tipoActual.entregasInformes)
            ? tipoActual.entregasInformes
            : [];

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

        const entregasOrdenadas = [...entregas].sort(
            (a, b) => Number(a.version || 0) - Number(b.version || 0)
        );

        const ultimaEntrega = entregasOrdenadas[entregasOrdenadas.length - 1];

        setDocumentoId(ultimaEntrega.id);

        setArchivoActual(ultimaEntrega.archivo?.url || null);

        setEstadoTutorDocente(
            ultimaEntrega.estado_tutor_docente || "PENDIENTE"
        );

        setEstadoTutorEmpresarial(
            ultimaEntrega.estado_tutor_empresarial || "PENDIENTE"
        );

        setArchivo(null);

        const textoPrevio =
            ultimaEntrega.practicaPracticante?.objetivo ||
            tipoActual.objetivo ||
            "";

        setObjetivo(textoPrevio);
        setObjetivoGuardado(textoPrevio);

        setTrazabilidad(construirTrazabilidad(entregasOrdenadas));

    }, [tipoActual]);


    // -----------------------------------------------------------
    // OBTENER INFORMES
    // -----------------------------------------------------------

    const cargarInformes = async () => {

        try {

            const data = await obtenerInformesPracticanteVigentes({
                practicaRequisitoDocumentoRepository
            });

            const informes = Array.isArray(data) ? data : [];

            setTipos(informes);

            setTipoSeleccionado((actual) => {

                const sigueExistiendo = informes.some(
                    (i) => String(i.id) === String(actual)
                );

                if (sigueExistiendo) return actual;

                return informes.length > 0 ? informes[0].id : null;
            });

        } catch (error) {

            console.error("No se pudieron cargar los informes:", error);

            toast.error("No se pudieron cargar los informes de la práctica");

        } finally {

            setCargandoInicial(false);

        }
    };


    // -----------------------------------------------------------
    // ARCHIVO: VALIDAR PDF Y TAMAÑO MÁXIMO DE 2 MB
    // -----------------------------------------------------------

    const setArchivoSeleccionado = (file) => {

        if (!file) return;

        // Validar formato PDF
        if (file.type !== "application/pdf") {

            toast.error("El archivo debe ser un PDF");

            setErrores((prev) => ({
                ...prev,
                archivo: true,
            }));

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        // Validar tamaño máximo: 2 MB
        if (file.size > MAX_FILE_SIZE) {

            toast.error("El PDF no puede superar los 2 MB");

            setErrores((prev) => ({
                ...prev,
                archivo: true,
            }));

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        // Liberar vista previa anterior
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


    // ARRAStrAR Y SOLTAR
    const handleDrop = (e) => {

        e.preventDefault();

        if (documentoBloqueado || bloqueadoPorFecha) return;

        if (!esNuevoDocumento && !puedeEditar) return;

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


    // -----------------------------------------------------------
    // VISUALIZAR PDF
    // -----------------------------------------------------------

    const handleVerPreview = () => {

        if (!previewUrl) return;

        setVisor({
            url: previewUrl,
            titulo: archivo?.name || "Vista previa",
        });
    };


    const handleVerDocumento = (url) => {

        if (!url) {
            toast.error("Este documento no tiene archivo disponible");
            return;
        }

        setVisor({
            url,
            titulo: nombreInforme,
        });
    };


    // -----------------------------------------------------------
    // DESCARGAR FORMATO
    // -----------------------------------------------------------

    const handleDescargarFormato = async () => {

        const url = tipoActual?.tipoRequisitoDocumento?.plantilla?.url;

        if (!url) {
            toast.error("Este informe no tiene un formato disponible");
            return;
        }

        try {

            setDescargandoFormato(true);

            await descargarArchivo(url, `Formato - ${nombreInforme}`);

        } catch (error) {

            console.error("No se pudo descargar el formato:", error);

            toast.error("No se pudo descargar el formato");

        } finally {

            setDescargandoFormato(false);

        }
    };


    // -----------------------------------------------------------
    // VALIDAR FORMULARIO
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

        } else if (archivo.size > MAX_FILE_SIZE) {

            nuevosErrores.archivo = true;
            valido = false;

            toast.error("El PDF no puede superar los 2 MB");

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
    // ENVIAR: PASO 1
    // -----------------------------------------------------------

    const handleEnviar = () => {

        if (bloqueadoPorFecha) {

            toast.error(
                "El plazo de entrega venció. Contáctate con tu tutor docente."
            );

            return;
        }

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

        if (!validarFormulario()) return;

        if (!tipoSeleccionado) {
            toast.error("Selecciona un tipo de informe");
            return;
        }

        setMostrarConfirmacion(true);
    };


    // -----------------------------------------------------------
    // ENVIAR: PASO 2
    // -----------------------------------------------------------

    const enviarInforme = async () => {

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

            await cargarInformes();

            await new Promise((resolve) => setTimeout(resolve, 0));

            setMostrarConfirmacion(false);

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            setArchivo(null);
            setPreviewUrl(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setErrores({
                archivo: false,
                objetivo: false,
            });

            toast.success("Informe enviado correctamente");

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

        <div className="flex flex-col lg:h-[calc(100vh-9rem)]">

            {cargandoInicial ? (

                <div className="flex justify-center mb-3 animate-pulse">
                    <Bar className="h-6 w-56" />
                </div>

            ) : (

                <h1 className="text-xl font-extrabold text-slate-800 text-center mb-3 tracking-tight shrink-0">
                    {nombreInforme}
                </h1>

            )}


            {cargandoInicial ? (

                <InformeDocumentoSkeleton />

            ) : (

                <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-1 gap-6 lg:flex-1 lg:min-h-0">


                    {/* ======================================================
                        COLUMNA IZQUIERDA
                    ====================================================== */}

                    <div className="flex flex-col gap-3 min-h-0">


                        {/* SELECT DE INFORME */}

                        <div>

                            <label className="block text-xs font-semibold text-slate-500 mb-1">
                                Tipo de informe
                            </label>

                            <select
                                value={tipoSeleccionado ?? ""}
                                onChange={(e) => setTipoSeleccionado(e.target.value)}
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

                            <h2 className="text-sm font-bold text-slate-800 mb-1.5">
                                Fechas de entrega
                            </h2>

                            <div className="grid grid-cols-2 gap-3">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">

                                    <p className="text-xs font-semibold text-slate-500">
                                        Fecha inicio
                                    </p>

                                    <p className="text-sm font-bold text-slate-700">
                                        {formatearFechaCorta(fechaInicio)}
                                    </p>

                                </div>

                                <div className={`rounded-xl border px-3 py-1.5 ${
                                    estadoFecha === "retrasada"
                                        ? "border-red-300 bg-red-50"
                                        : estadoFecha === "por_vencer"
                                            ? "border-amber-300 bg-amber-50"
                                            : "border-slate-200 bg-slate-50"
                                }`}>

                                    <p className="text-xs font-semibold text-slate-500">
                                        Fecha máxima
                                    </p>

                                    <p className={`text-sm font-bold ${
                                        estadoFecha === "retrasada"
                                            ? "text-red-700"
                                            : estadoFecha === "por_vencer"
                                                ? "text-amber-700"
                                                : "text-slate-700"
                                    }`}>
                                        {formatearFechaCorta(fechaFin)}
                                    </p>

                                </div>

                            </div>


                            {estadoFecha === "retrasada" && (

                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5">

                                    <AlertTriangle size={16} className="text-red-500 shrink-0" />

                                    <div>
                                        <p className="text-xs font-bold text-red-700">
                                            Plazo de entrega vencido
                                        </p>

                                        <p className="text-[11px] text-red-600">
                                            La fecha máxima ya pasó y no puedes subir el documento.
                                            Contáctate con tu tutor docente.
                                        </p>
                                    </div>

                                </div>

                            )}

                            {estadoFecha === "por_vencer" && (

                                <div className="mt-2 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5">

                                    <Clock size={16} className="text-amber-500 shrink-0" />

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


                        {/* OBJETIVO DE LA PRÁCTICA */}

                        {esPlanDeTrabajo && (

                            <div>

                                <label
                                    htmlFor="objetivo-practica"
                                    className="block text-sm font-bold text-slate-800 mb-1.5"
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
                                    rows={3}
                                    placeholder={
                                        objetivoGuardado ||
                                        "Describe el objetivo que buscas alcanzar durante tu práctica..."
                                    }
                                    className={`w-full px-3 py-2 rounded-xl border text-sm text-slate-700 resize-none focus:outline-none bg-white disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed ${
                                        errores.objetivo
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

                            <div className="flex items-center justify-between mb-1.5">

                                <h2 className="text-sm font-bold text-slate-800">
                                    Cargar Formato
                                </h2>

                                <button
                                    onClick={handleDescargarFormato}
                                    disabled={descargandoFormato}
                                    className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors disabled:opacity-60"
                                >

                                    {descargandoFormato ? (
                                        <Loader2 size={13} className="animate-spin" />
                                    ) : (
                                        <Download size={13} />
                                    )}

                                    {descargandoFormato
                                        ? "Descargando..."
                                        : "Descargar formato"}

                                </button>

                            </div>


                            {documentoAprobadoPorAmbos ? (

                                <div className="w-full h-28 border-2 border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center">

                                    <CheckCircle2 size={22} className="text-emerald-500 mb-0.5" />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Documento aprobado
                                    </p>

                                    <p className="text-xs text-slate-400 text-center px-4">
                                        El tutor docente y el tutor empresarial aprobaron este documento.
                                    </p>

                                    {archivoActual && (
                                        <button
                                            onClick={() => handleVerDocumento(archivoActual)}
                                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-0.5"
                                        >
                                            <Eye size={13} />
                                            Ver documento
                                        </button>
                                    )}

                                </div>

                            ) : estadoTutorDocente === "VENCIDO" ||
                                estadoTutorEmpresarial === "VENCIDO" ? (

                                <div className="w-full h-28 border-2 border-slate-300 rounded-2xl bg-slate-50 flex flex-col items-center justify-center px-6">

                                    <Clock size={22} className="text-slate-500 mb-0.5" />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Documento vencido
                                    </p>

                                    <p className="text-xs text-slate-400 text-center">
                                        Este documento no puede modificarse.
                                    </p>

                                </div>

                            ) : bloqueadoPorFecha ? (

                                <div className="w-full h-28 border-2 border-red-200 rounded-2xl bg-red-50/40 flex flex-col items-center justify-center px-6">

                                    <AlertTriangle size={22} className="text-red-500 mb-0.5" />

                                    <p className="text-sm font-semibold text-slate-700">
                                        Plazo de entrega vencido
                                    </p>

                                    <p className="text-xs text-slate-500 text-center">
                                        Contáctate con tu tutor docente.
                                    </p>

                                    {archivoActual && (
                                        <button
                                            onClick={() => handleVerDocumento(archivoActual)}
                                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 mt-0.5"
                                        >
                                            <Eye size={13} />
                                            Ver documento actual
                                        </button>
                                    )}

                                </div>

                            ) : archivo ? (

                                <div className="w-full h-28 border-2 rounded-2xl bg-white flex flex-col items-center justify-center px-6 relative border-slate-200">

                                    <button
                                        onClick={handleQuitarArchivo}
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                                        title="Quitar archivo"
                                    >
                                        <X size={16} />
                                    </button>

                                    <FileText size={22} className="text-red-500 mb-0.5" />

                                    <p className="text-sm font-semibold text-slate-700 text-center truncate max-w-[220px]">
                                        {archivo.name}
                                    </p>

                                    <p className="text-xs text-slate-400 mb-1">
                                        {(archivo.size / 1024).toFixed(0)} KB / 2 MB
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

                                <div className="flex flex-col gap-2">

                                    {archivoActual && (

                                        <div className="w-full h-14 border border-red-200 rounded-2xl bg-red-50/40 flex items-center justify-between px-4">

                                            <div className="flex items-center gap-2 min-w-0">

                                                <FileText size={20} className="text-red-500 shrink-0" />

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
                                                onClick={() => handleVerDocumento(archivoActual)}
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
                                        className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl bg-white cursor-pointer transition-colors ${
                                            errores.archivo
                                                ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] bg-red-50/20"
                                                : "border-red-300 hover:bg-red-50/40"
                                        }`}
                                    >

                                        <UploadCloud size={22} className="text-slate-800 mb-1" />

                                        <span className="text-sm font-semibold text-slate-700">
                                            Seleccionar nuevo PDF
                                        </span>

                                        <span className="text-[11px] text-slate-400">
                                            Formato PDF · Tamaño máximo 2 MB
                                        </span>

                                        {errores.archivo && (
                                            <span className="text-[11px] text-red-500">
                                                Selecciona un PDF válido de máximo 2 MB
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

                                <div className="w-full h-28 border-2 rounded-2xl bg-white flex flex-col items-center justify-center px-6 relative border-slate-200">

                                    <FileText size={22} className="text-red-500 mb-0.5" />

                                    <p className="text-sm font-semibold text-slate-700 text-center truncate max-w-[260px]">
                                        Documento actual
                                    </p>

                                    <p className="text-xs text-slate-400 mb-1 text-center">
                                        Solo puedes modificarlo si alguno de los tutores lo rechaza
                                    </p>

                                    <button
                                        onClick={() => handleVerDocumento(archivoActual)}
                                        className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                    >
                                        <Eye size={13} />
                                        Ver
                                    </button>

                                </div>

                            ) : (

                                <label
                                    htmlFor="documento-pdf"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl bg-white cursor-pointer transition-colors ${
                                        errores.archivo
                                            ? "border-red-500 shadow-[0_0_0_3px_rgba(239,68,68,0.15)] bg-red-50/20"
                                            : "border-red-300 hover:bg-red-50/40"
                                    }`}
                                >

                                    <UploadCloud size={22} className="text-slate-800 mb-1" />

                                    <span className="text-sm font-semibold text-slate-700">
                                        Subir PDF
                                    </span>

                                    <span className="text-[11px] text-slate-400">
                                        Formato PDF · Tamaño máximo 2 MB
                                    </span>

                                    {errores.archivo && (
                                        <span className="text-[11px] text-red-500 mt-1">
                                            Selecciona un PDF válido de máximo 2 MB
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


                        {/* BOTÓN ENVIAR */}

                        <button
                            onClick={handleEnviar}
                            disabled={
                                enviando ||
                                bloqueadoPorFecha ||
                                documentoAprobadoPorAmbos ||
                                (tieneDocumento && !puedeEditar)
                            }
                            className="mx-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-7 py-2.5 rounded-2xl transition-colors"
                        >

                            {enviando ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Send size={16} />
                            )}

                            {textoBoton}

                        </button>


                        {tieneDocumento &&
                            !puedeEditar &&
                            !documentoAprobadoPorAmbos &&
                            !(
                                estadoTutorDocente === "VENCIDO" ||
                                estadoTutorEmpresarial === "VENCIDO"
                            ) && (

                                <p className="text-center text-[11px] text-slate-400 -mt-1">
                                    El informe solo podrá actualizarse si el tutor
                                    docente o el tutor empresarial lo rechaza o lo comenta.
                                </p>

                            )}

                    </div>


                    {/* ======================================================
                        COLUMNA DERECHA
                    ====================================================== */}

                    <div className="flex flex-col gap-3 min-h-0">

                        <EstadoPanel
                            estadoTutorDocente={estadoTutorDocente}
                            estadoTutorEmpresarial={estadoTutorEmpresarial}
                        />

                        <div className="flex items-center justify-between shrink-0">

                            <h2 className="text-sm font-bold text-slate-800">
                                Trazabilidad
                            </h2>

                            {trazabilidad.length > 0 && (
                                <span className="text-[10px] font-semibold text-slate-400">
                                    {trazabilidad.length} movimiento{trazabilidad.length !== 1 ? "s" : ""}
                                </span>
                            )}

                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-4 min-h-[240px] lg:min-h-0 lg:flex-1 overflow-y-auto">
                            <TrazabilidadTimeline eventos={trazabilidad} />
                        </div>

                    </div>

                </div>

            )}


            {/* ======================================================
                MODAL: VER PDF
            ====================================================== */}

            {visor && (

                <VisorPdfModal
                    url={visor.url}
                    titulo={visor.titulo}
                    onClose={() => setVisor(null)}
                />

            )}


            {/* ======================================================
                MODAL: CONFIRMAR ENVÍO
            ====================================================== */}

            {mostrarConfirmacion && previewUrl && (

                <VisorPdfModal
                    url={previewUrl}
                    titulo="Confirmar envío"
                    subtitulo={
                        enviando
                            ? "Enviando informe..."
                            : `${archivo?.name ?? ""} · ${archivo ? (archivo.size / 1024).toFixed(0) : 0} KB`
                    }
                    bloqueado={enviando}
                    onClose={() => setMostrarConfirmacion(false)}
                    pie={(
                        <>

                            {esPlanDeTrabajo && (

                                <div className="px-5 py-2.5 border-t border-slate-200 bg-slate-50 shrink-0">

                                    <p className="text-xs font-semibold text-slate-500">
                                        Objetivo de la práctica
                                    </p>

                                    <p className="text-sm text-slate-700 line-clamp-2">
                                        {objetivo}
                                    </p>

                                </div>

                            )}

                            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 shrink-0">

                                <p className="text-xs text-slate-500">
                                    Revisa que el documento sea el correcto antes de enviarlo.
                                </p>

                                <div className="flex items-center gap-2 shrink-0">

                                    <button
                                        onClick={() => setMostrarConfirmacion(false)}
                                        disabled={enviando}
                                        className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                                    >
                                        Cambiar archivo
                                    </button>

                                    <button
                                        onClick={enviarInforme}
                                        disabled={enviando}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2 rounded-2xl transition-colors"
                                    >

                                        {enviando ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <Send size={15} />
                                        )}

                                        {enviando ? "Enviando..." : "Confirmar y enviar"}

                                    </button>

                                </div>

                            </div>

                        </>
                    )}
                />

            )}

        </div>

    );
}
