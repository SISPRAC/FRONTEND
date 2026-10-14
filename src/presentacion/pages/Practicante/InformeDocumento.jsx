import { useEffect, useState, useRef } from "react";

import { practicaRequisitoDocumentoRepository } from "../../../infraestructura/repository/practicaRequisitoDocumentoRepository.js";
import { entregaInformeRepository } from "../../../infraestructura/repository/entregaInformeRepository.js";

import { obtenerInformesPracticanteVigentes } from "../../../aplicacion/practicaRequisitoDocumento/obtenerInformesPracticanteVigentes.js";
import { crearEntregaInforme } from "../../../aplicacion/entregaInforme/crearEntregaInforme.js";

import {
    UploadCloud,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Eye,
    Download,
    X,
} from "lucide-react";

import toast from "react-hot-toast";


// ---------------------------------------------------------------
// Formatear fecha
// ---------------------------------------------------------------

function formatearFechaCorta(fecha) {

    if (!fecha) return "—";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
        return fecha;
    }

    return date.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}


// ---------------------------------------------------------------
// Panel de estado
// ---------------------------------------------------------------

function EstadoPanel({
    estadoTutorDocente,
    estadoTutorEmpresarial
}) {

    const obtenerConfig = (estado, tipo) => {

        if (estado === "APROBADO") {

            return {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                iconBg: "bg-emerald-500",
                icon: <CheckCircle2 size={17} className="text-white" />,
                title: tipo === "docente"
                    ? "Tutor docente"
                    : "Tutor empresarial",
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
                title: tipo === "docente"
                    ? "Tutor docente"
                    : "Tutor empresarial",
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
                title: tipo === "docente"
                    ? "Tutor docente"
                    : "Tutor empresarial",
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
                title: tipo === "docente"
                    ? "Tutor docente"
                    : "Tutor empresarial",
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
                title: tipo === "docente"
                    ? "Tutor docente"
                    : "Tutor empresarial",
                subtitle: "Documento vencido",
                text: "text-slate-600"
            };

        }

        return {
            bg: "bg-orange-50",
            border: "border-orange-200",
            iconBg: "bg-orange-400",
            icon: <Clock size={17} className="text-white" />,
            title: tipo === "docente"
                ? "Tutor docente"
                : "Tutor empresarial",
            subtitle: "Esperando revisión",
            text: "text-orange-700"
        };
    };


    const docente =
        obtenerConfig(
            estadoTutorDocente || "PENDIENTE",
            "docente"
        );


    const empresarial =
        obtenerConfig(
            estadoTutorEmpresarial || "PENDIENTE",
            "empresarial"
        );


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
// Trazabilidad
// ---------------------------------------------------------------

function TrazabilidadTimeline({ eventos }) {

    const config = {

        CARGADO: {
            color: "bg-blue-500",
            icon: <UploadCloud size={15} className="text-white" />,
        },

        ACTUALIZADO: {
            color: "bg-blue-500",
            icon: <UploadCloud size={15} className="text-white" />,
        },

        PENDIENTE: {
            color: "bg-orange-400",
            icon: <Clock size={15} className="text-white" />,
        },

        APROBADO: {
            color: "bg-emerald-500",
            icon: <CheckCircle2 size={15} className="text-white" />,
        },

        RECHAZADO: {
            color: "bg-red-500",
            icon: <XCircle size={15} className="text-white" />,
        },

        OBSERVACION: {
            color: "bg-slate-400",
            icon: <FileText size={15} className="text-white" />,
        },

        COMENTADO: {
            color: "bg-slate-400",
            icon: <FileText size={15} className="text-white" />,
        },

        VENCIDO: {
            color: "bg-slate-500",
            icon: <Clock size={15} className="text-white" />,
        },

    };


    const formatearFecha = (fecha) => {

        if (!fecha) return "";

        const date = new Date(fecha);

        if (Number.isNaN(date.getTime())) {
            return fecha;
        }

        return date.toLocaleString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    };


    const eventosOrdenados = [...eventos].sort(
        (a, b) =>
            new Date(a.fecha).getTime() -
            new Date(b.fecha).getTime()
    );


    return (

        <div className="trazabilidad-scroll h-full overflow-y-auto pr-2">

            {eventosOrdenados.length === 0 ? (

                <div className="h-full flex items-center justify-center">

                    <p className="text-slate-400 text-sm">
                        Sin movimientos aún
                    </p>

                </div>

            ) : (

                <div className="relative pl-1">

                    {eventosOrdenados.map((ev, i) => {

                        const c =
                            config[ev.accion] ||
                            config.OBSERVACION;

                        const esUltimo =
                            i === eventosOrdenados.length - 1;


                        return (

                            <div
                                key={ev.id ?? i}
                                className="relative flex gap-3 pb-5 last:pb-0"
                            >

                                {!esUltimo && (

                                    <div
                                        className="absolute left-[14px] top-[28px] bottom-0 w-[2px] bg-slate-200"
                                    />

                                )}


                                <div
                                    className={`relative z-10 w-[28px] h-[28px] rounded-full ${c.color} flex items-center justify-center shrink-0 shadow-sm`}
                                >
                                    {c.icon}
                                </div>


                                <div className="flex-1 min-w-0 pt-0.5">

                                    <div className="flex items-start justify-between gap-3">

                                        <p className="text-xs font-bold text-slate-800 leading-tight">
                                            {ev.accion}
                                        </p>

                                        <p className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {formatearFecha(ev.fecha)}
                                        </p>

                                    </div>


                                    {ev.comentario && (

                                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                            {ev.comentario}
                                        </p>

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}


// ---------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------

export default function InformeDocumento() {

    const fileInputRef = useRef(null);


    // -----------------------------------------------------------
    // INFORMES VIGENTES
    // -----------------------------------------------------------

    const [tipos, setTipos] = useState([]);

    const [tipoSeleccionado, setTipoSeleccionado] =
        useState(null);


    // -----------------------------------------------------------
    // ARCHIVO
    // -----------------------------------------------------------

    const [archivo, setArchivo] = useState(null);

    const [previewUrl, setPreviewUrl] =
        useState(null);


    const [enviando, setEnviando] =
        useState(false);


    // -----------------------------------------------------------
    // FECHAS
    // -----------------------------------------------------------

    const [fechaInicio, setFechaInicio] =
        useState(null);

    const [fechaFin, setFechaFin] =
        useState(null);


    // -----------------------------------------------------------
    // ESTADOS DE LOS TUTORES
    // -----------------------------------------------------------

    const [estadoTutorDocente, setEstadoTutorDocente] =
        useState("PENDIENTE");

    const [estadoTutorEmpresarial, setEstadoTutorEmpresarial] =
        useState("PENDIENTE");


    // -----------------------------------------------------------
    // TRAZABILIDAD
    // -----------------------------------------------------------

    const [trazabilidad, setTrazabilidad] =
        useState([]);


    // -----------------------------------------------------------
    // DOCUMENTO ACTUAL
    // -----------------------------------------------------------

    const [documentoId, setDocumentoId] =
        useState(null);

    const [archivoActual, setArchivoActual] =
        useState(null);


    const [errores, setErrores] = useState({
        archivo: false,
    });


    // -----------------------------------------------------------
    // REGLAS DE EDICIÓN
    // -----------------------------------------------------------

    const tieneDocumento =
        Boolean(documentoId);


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


    const esNuevoDocumento =
        !tieneDocumento;


    const tipoActual =
        tipos.find(
            (tipo) =>
                String(tipo.id) ===
                String(tipoSeleccionado)
        );


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

            return;
        }


        setFechaInicio(
            tipoActual.fecha_inicio
        );

        setFechaFin(
            tipoActual.fecha_limite
        );


        const entregas =
            Array.isArray(tipoActual.entregasInformes)
                ? tipoActual.entregasInformes
                : [];


        if (entregas.length === 0) {

            setDocumentoId(null);
            setArchivoActual(null);

            setEstadoTutorDocente("PENDIENTE");
            setEstadoTutorEmpresarial("PENDIENTE");

            setTrazabilidad([]);

            setArchivo(null);

            return;
        }


        // -------------------------------------------------------
        // TOMAR LA ÚLTIMA VERSIÓN
        // -------------------------------------------------------

        const entregasOrdenadas =
            [...entregas].sort(
                (a, b) =>
                    Number(a.version || 0) -
                    Number(b.version || 0)
            );


        const ultimaEntrega =
            entregasOrdenadas[
            entregasOrdenadas.length - 1
            ];


        setDocumentoId(
            ultimaEntrega.id
        );


        setArchivoActual(
            ultimaEntrega.archivo?.url || null
        );


        setEstadoTutorDocente(
            ultimaEntrega.estado_tutor_docente ||
            "PENDIENTE"
        );


        setEstadoTutorEmpresarial(
            ultimaEntrega.estado_tutor_empresarial ||
            "PENDIENTE"
        );


        setArchivo(null);


        // -------------------------------------------------------
        // CONSTRUIR TRAZABILIDAD
        // -------------------------------------------------------

        const eventos = [];


        entregasOrdenadas.forEach((entrega) => {

            const version =
                entrega.version || 1;


            // Entrega del practicante

            eventos.push({
                id: `entrega-${entrega.id}`,
                accion:
                    version > 1
                        ? `ACTUALIZADO — Versión ${version}`
                        : `CARGADO — Versión ${version}`,
                fecha: entrega.fecha_entrega,
                comentario:
                    `Documento enviado por el practicante`
            });


            // Tutor docente

            if (
                entrega.estado_tutor_docente &&
                entrega.estado_tutor_docente !== "PENDIENTE"
            ) {

                eventos.push({
                    id: `docente-${entrega.id}`,
                    accion: entrega.estado_tutor_docente,
                    fecha:
                        entrega.fecha_revision_tutor_docente ||
                        entrega.fecha_entrega,
                    comentario:
                        entrega.observacion_tutor_docente
                            ? `Tutor docente: ${entrega.observacion_tutor_docente}`
                            : "Revisión del tutor docente"
                });

            }


            // Tutor empresarial

            if (
                entrega.estado_tutor_empresarial &&
                entrega.estado_tutor_empresarial !== "PENDIENTE"
            ) {

                eventos.push({
                    id: `empresarial-${entrega.id}`,
                    accion: entrega.estado_tutor_empresarial,
                    fecha:
                        entrega.fecha_revision_tutor_empresarial ||
                        entrega.fecha_entrega,
                    comentario:
                        entrega.observacion_tutor_empresarial
                            ? `Tutor empresarial: ${entrega.observacion_tutor_empresarial}`
                            : "Revisión del tutor empresarial"
                });

            }

        });


        setTrazabilidad(eventos);

    }, [tipoActual]);


    // -----------------------------------------------------------
    // OBTENER INFORMES
    // -----------------------------------------------------------

    const cargarInformes = async () => {

        try {

            const data =
                await obtenerInformesPracticanteVigentes(
                    {
                        practicaRequisitoDocumentoRepository
                    }
                );


            const informes =
                Array.isArray(data)
                    ? data
                    : [];


            setTipos(informes);


            if (informes.length > 0) {

                setTipoSeleccionado(
                    informes[0].id
                );

            } else {

                setTipoSeleccionado(null);

            }


        } catch (error) {

            console.error(
                "No se pudieron cargar los informes:",
                error
            );


            toast.error(
                "No se pudieron cargar los informes de la práctica"
            );

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


            toast.error(
                "El archivo debe ser un PDF"
            );

            return;

        }


        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }


        setArchivo(file);


        setPreviewUrl(
            URL.createObjectURL(file)
        );


        setErrores((prev) => ({
            ...prev,
            archivo: false,
        }));

    };


    const handleSelectFile = (e) => {

        const file =
            e.target.files?.[0];


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


        const file =
            e.dataTransfer.files?.[0];


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


        window.open(
            previewUrl,
            "_blank",
            "noopener,noreferrer"
        );

    };


    const handleDescargarDocumento = (url) => {

        if (!url) {

            toast.error(
                "Este documento no tiene archivo disponible"
            );

            return;

        }


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    };


    // -----------------------------------------------------------
    // DESCARGAR FORMATO
    // -----------------------------------------------------------

    const handleDescargarFormato = () => {

        const url =
            tipoActual?.tipoRequisitoDocumento
                ?.plantilla
                ?.url;


        if (!url) {

            toast.error(
                "Este informe no tiene un formato disponible"
            );

            return;

        }


        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );

    };


    // -----------------------------------------------------------
    // VALIDAR
    // -----------------------------------------------------------

    const validarFormulario = () => {

        const nuevosErrores = {
            archivo: false,
        };


        let valido = true;


        if (!archivo) {

            nuevosErrores.archivo = true;

            valido = false;


            toast.error(
                "Selecciona un PDF antes de enviar"
            );

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

            toast.error(
                "Selecciona un tipo de informe"
            );

            return;

        }


        try {

            setEnviando(true);


            const formData = new FormData();


            formData.append(
                "practica_requisito_documento_id",
                tipoSeleccionado
            );


            formData.append(
                "archivo",
                archivo
            );


            await crearEntregaInforme(
                {
                    entregaInformeRepository
                },
                formData
            );


            toast.success(
                "Informe enviado correctamente"
            );


            setArchivo(null);


            if (previewUrl) {

                URL.revokeObjectURL(
                    previewUrl
                );

            }


            setPreviewUrl(null);


            if (fileInputRef.current) {

                fileInputRef.current.value = "";

            }


            setErrores({
                archivo: false,
            });


            await cargarInformes();


        } catch (error) {

            console.error(
                "No se pudo enviar el informe:",
                error
            );


            toast.error(
                error.response?.data?.message ||
                "No se pudo enviar el informe"
            );


        } finally {

            setEnviando(false);

        }

    };


    // -----------------------------------------------------------
    // TEXTO DEL BOTÓN
    // -----------------------------------------------------------

    const textoBoton = enviando
        ? "Enviando..."
        : "Enviar";


    // -----------------------------------------------------------
    // RENDER
    // -----------------------------------------------------------

    return (

        <div>

            {/* Ocultar completamente la barra de scroll
                de la trazabilidad */}

            <style>{`
                .trazabilidad-scroll::-webkit-scrollbar {
                    width: 0px;
                    height: 0px;
                    display: none;
                }

                .trazabilidad-scroll {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>


            <h1 className="text-[24px] font-extrabold text-slate-800 text-center mb-5 tracking-tight">

                {tipoActual
                    ?.tipoRequisitoDocumento
                    ?.nombre || "Informe"}

            </h1>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


                {/* ======================================================
                    COLUMNA IZQUIERDA
                ====================================================== */}

                <div className="flex flex-col gap-4">


                    {/* ==================================================
                        SELECT DE INFORME
                    ================================================== */}

                    <div>

                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                            Tipo de informe
                        </label>


                        <select
                            value={tipoSeleccionado ?? ""}
                            onChange={(e) =>
                                setTipoSeleccionado(
                                    e.target.value
                                )
                            }
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-red-400 bg-white"
                        >

                            {tipos.length === 0 ? (

                                <option value="">
                                    No hay informes vigentes
                                </option>

                            ) : (

                                tipos.map((tipo) => (

                                    <option
                                        key={tipo.id}
                                        value={tipo.id}
                                    >

                                        {
                                            tipo
                                                .tipoRequisitoDocumento
                                                ?.nombre
                                        }

                                    </option>

                                ))

                            )}

                        </select>

                    </div>


                    {/* ==================================================
                        FECHAS
                    ================================================== */}

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

                                    {formatearFechaCorta(
                                        fechaInicio
                                    )}

                                </p>

                            </div>


                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

                                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                                    Fecha máxima
                                </p>


                                <p className="text-sm font-bold text-slate-700">

                                    {formatearFechaCorta(
                                        fechaFin
                                    )}

                                </p>

                            </div>


                        </div>

                    </div>


                    {/* ==================================================
                        CARGAR FORMATO
                    ================================================== */}

                    <div>

                        <div className="flex items-center justify-between mb-2">

                            <h2 className="text-sm font-bold text-slate-800">
                                Cargar Formato
                            </h2>


                            <button
                                onClick={
                                    handleDescargarFormato
                                }
                                className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                            >

                                <Download size={13} />

                                Descargar formato

                            </button>

                        </div>


                        {/* =================================================
                            DOCUMENTO APROBADO POR AMBOS
                        ================================================= */}

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
                                            handleDescargarDocumento(
                                                archivoActual
                                            )
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


                            /* =============================================
                               DOCUMENTO VENCIDO
                            ============================================= */

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


                            /* =============================================
                               ARCHIVO NUEVO SELECCIONADO
                            ============================================= */

                            <div className="w-full h-32 border-2 rounded-2xl bg-white flex flex-col items-center justify-center px-6 relative border-slate-200">

                                <button
                                    onClick={
                                        handleQuitarArchivo
                                    }
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
                                    onClick={
                                        handleVerPreview
                                    }
                                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                >

                                    <Eye size={13} />

                                    Ver

                                </button>

                            </div>


                        ) : puedeEditar ? (


                            /* =============================================
                               PUEDE EDITAR POR RECHAZO
                            ============================================= */

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
                                                handleDescargarDocumento(
                                                    archivoActual
                                                )
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
                                    onDragOver={(e) =>
                                        e.preventDefault()
                                    }
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl bg-white cursor-pointer transition-colors ${
                                        errores.archivo
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
                                        onChange={
                                            handleSelectFile
                                        }
                                    />

                                </label>

                            </div>


                        ) : archivoActual ? (


                            /* =============================================
                               DOCUMENTO EXISTENTE SIN PERMISO DE EDICIÓN
                            ============================================= */

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
                                        handleDescargarDocumento(
                                            archivoActual
                                        )
                                    }
                                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                                >

                                    <Eye size={13} />

                                    Ver

                                </button>

                            </div>


                        ) : (


                            /* =============================================
                               SIN DOCUMENTO
                            ============================================= */

                            <label
                                htmlFor="documento-pdf"
                                onDragOver={(e) =>
                                    e.preventDefault()
                                }
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl bg-white cursor-pointer transition-colors ${
                                    errores.archivo
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
                                    onChange={
                                        handleSelectFile
                                    }
                                />

                            </label>

                        )}

                    </div>


                    {/* ==================================================
                        BOTÓN ENVIAR / ACTUALIZAR
                    ================================================== */}

                    <button
                        onClick={handleEnviar}
                        disabled={
                            enviando ||
                            documentoAprobadoPorAmbos ||
                            (
                                tieneDocumento &&
                                !puedeEditar
                            )
                        }
                        className="mx-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-sm px-7 py-2.5 rounded-2xl transition-colors"
                    >

                        <Send size={16} />

                        {textoBoton}

                    </button>


                    {/* ==================================================
                        MENSAJE CUANDO ESTÁ BLOQUEADO
                    ================================================== */}

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
                        estadoTutorDocente={
                            estadoTutorDocente
                        }
                        estadoTutorEmpresarial={
                            estadoTutorEmpresarial
                        }
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

                        <TrazabilidadTimeline
                            eventos={trazabilidad}
                        />

                    </div>


                </div>


            </div>

        </div>

    );

}

