
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    X,
    ChevronLeft,
    ChevronRight,
    FileText,
    Download,
    LoaderCircle,
    Building2,
    Hash,
    CalendarDays,
    Clock,
    GraduationCap,
    CalendarCheck,
    Image as ImageIcon
} from "lucide-react";
import toast from "react-hot-toast";

import { obtenerVisitaPorSolicitud } from "../../../aplicacion/visita/obtenerVisitaPorSolicitud.js";
import { visitaRepository } from "../../../infraestructura/repository/visitaRepository.js";

const MAX_MINIATURAS = 4;

const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const fechaTexto = String(fecha).split("T")[0];
    const [year, month, day] = fechaTexto.split("-");

    if (!year || !month || !day) return "Sin fecha";

    return `${day}/${month}/${year}`;
};

const formatearHora = (hora) => {
    if (!hora) return "Sin hora";

    const [horas, minutos] = String(hora).split(":");
    let horaNumero = Number(horas);

    if (Number.isNaN(horaNumero) || !minutos) {
        return "Sin hora";
    }

    const periodo = horaNumero >= 12 ? "p. m." : "a. m.";

    if (horaNumero === 0) {
        horaNumero = 12;
    } else if (horaNumero > 12) {
        horaNumero -= 12;
    }

    return `${horaNumero}:${minutos} ${periodo}`;
};

const nombreCompleto = (persona) => {
    if (!persona) return "";

    if (typeof persona === "string") {
        return persona.trim();
    }

    return [
        persona.nombres || persona.nombre,
        persona.apellidos
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
};

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Icon size={17} />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p className="break-words text-sm font-semibold leading-snug text-gray-900">
                    {value || "Sin información"}
                </p>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, children }) {
    return (
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-900">
            <Icon size={16} className="text-red-500" />
            {children}
        </h2>
    );
}

function ImageLightbox({ images, index, onClose, onChange }) {
    useEffect(() => {
        if (index === null || images.length === 0) return;

        const onKey = (e) => {
            if (e.key === "Escape") onClose();

            if (e.key === "ArrowRight") {
                onChange((index + 1) % images.length);
            }

            if (e.key === "ArrowLeft") {
                onChange((index - 1 + images.length) % images.length);
            }
        };

        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
        };
    }, [index, images.length, onChange, onClose]);

    if (index === null || !images[index]) return null;

    const imagen = images[index];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
            onClick={onClose}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar imagen"
                className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
                <X size={22} />
            </button>

            {images.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange((index - 1 + images.length) % images.length);
                    }}
                    aria-label="Imagen anterior"
                    className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-8"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            <img
                src={imagen.url}
                alt={imagen.alt}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />

            {images.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange((index + 1) % images.length);
                    }}
                    aria-label="Imagen siguiente"
                    className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:right-8"
                >
                    <ChevronRight size={24} />
                </button>
            )}

            {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-white/80">
                    {index + 1} / {images.length}
                </div>
            )}
        </div>
    );
}

function PdfPreviewModal({ open, onClose, fileUrl, fileName }) {
    useEffect(() => {
        if (!open) return;

        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", onKey);

        return () => {
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open || !fileUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-gray-800">
                        <FileText size={18} className="flex-none text-red-500" />

                        <span className="truncate">
                            {fileName || "Informe de visita"}
                        </span>
                    </div>

                    <div className="flex flex-none items-center gap-2">
                        <a
                            href={fileUrl}
                            download={fileName || "Informe_visita.pdf"}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            <Download size={14} />
                            Descargar
                        </a>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar informe"
                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <iframe
                    title={fileName || "Informe de visita"}
                    src={fileUrl}
                    className="h-full w-full flex-1"
                />
            </div>
        </div>
    );
}

export default function VisitaEmpresarialPage({
    visita: visitaProp,
    onRegresar
}) {
    const location = useLocation();
    const navigate = useNavigate();

    // Datos que pueden llegar desde la navegación.
    const solicitud =
        location.state?.solicitud ||
        visitaProp?.solicitud ||
        null;

    const visitaRecibida =
        location.state?.visita ||
        visitaProp?.visita ||
        (visitaProp?.solicitud_visita_id ? visitaProp : null);

    const solicitudId =
        solicitud?.id ||
        visitaRecibida?.solicitud_visita_id;

    const [visitaCompleta, setVisitaCompleta] = useState(
        visitaRecibida?.data || visitaRecibida || null
    );

    const [cargando, setCargando] = useState(!visitaRecibida);
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [pdfOpen, setPdfOpen] = useState(false);

    // Cargar la visita cuando no llega desde la navegación.
    useEffect(() => {
        if (visitaRecibida) {
            setVisitaCompleta(
                visitaRecibida?.data || visitaRecibida
            );
            setCargando(false);
            return;
        }

        if (!solicitudId) {
            setCargando(false);
            return;
        }

        let cancelado = false;

        const cargarVisita = async () => {
            setCargando(true);

            try {
                const resultado = await obtenerVisitaPorSolicitud(
                    { visitaRepository },
                    solicitudId
                );

                const datos = resultado?.data || resultado;

                if (!cancelado) {
                    setVisitaCompleta(datos);
                }
            } catch (error) {
                console.error(
                    "Error al cargar la visita:",
                    error
                );

                if (!cancelado) {
                    toast.error(
                        "No se pudo cargar la información de la visita."
                    );
                }
            } finally {
                if (!cancelado) {
                    setCargando(false);
                }
            }
        };

        cargarVisita();

        return () => {
            cancelado = true;
        };
    }, [solicitudId, visitaRecibida]);

    const handleRegresar = () => {
        if (onRegresar) {
            onRegresar();
        } else {
            navigate(-1);
        }
    };

    if (cargando) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <LoaderCircle
                        size={32}
                        className="animate-spin text-red-500"
                    />

                    <p className="text-sm">
                        Cargando información de la visita...
                    </p>
                </div>
            </div>
        );
    }

    if (!visitaCompleta) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="text-center">
                    <p className="mb-4 text-sm text-gray-500">
                        No se encontró la información de la visita.
                    </p>

                    <button
                        type="button"
                        onClick={handleRegresar}
                        className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                    >
                        Regresar
                    </button>
                </div>
            </div>
        );
    }

    // Admite tanto la visita directa como un objeto anidado.
    const registroVisita =
        visitaCompleta.visita || visitaCompleta;

    /*
     * Los datos principales vienen directamente en visitaCompleta,
     * tal como muestra la respuesta de tu backend.
     */

    const practicantes =
        visitaCompleta.practicantes ||
        solicitud?.practicantes ||
        [];

    // El código está dentro de:
    // practicaPracticante -> practicante -> candidato -> codigo
    const codigos = practicantes
        .map((p) =>
            p.practicaPracticante?.practicante?.candidato?.codigo ||
            p.codigo ||
            ""
        )
        .filter(Boolean);

    const codigoPracticante =
        codigos.length > 0
            ? codigos.join(", ")
            : "Sin código registrado";

    // Empresa devuelta por el backend.
    const empresa =
        visitaCompleta.empresa ||
        solicitud?.empresa ||
        {};

    const nombreEmpresa =
        empresa.nombre ||
        solicitud?.empresaNombre ||
        "Sin empresa registrada";

    const fotoEmpresa = empresa.logo || null;

    // Tutor docente responsable devuelto por el backend.
    const tutor =
        visitaCompleta.responsable ||
        registroVisita.responsable ||
        solicitud?.responsable ||
        null;

    const nombreTutor =
        nombreCompleto(tutor) ||
        "Sin tutor registrado";

    const detalleTutor =
        typeof tutor === "object" && tutor
            ? tutor.cargo || tutor.correo || tutor.email || ""
            : "";

    const fechaVisita =
        registroVisita.fecha_visita ||
        solicitud?.fecha_visita;

    const horaVisita =
        registroVisita.hora_visita ||
        solicitud?.hora_visita;

    const descripcion =
        registroVisita.descripcion ||
        "Sin descripción registrada.";

    // Evidencias asociadas a la visita.
    const archivos =
        registroVisita.evidencias ||
        registroVisita.VisitaArchivos ||
        [];

    const evidencias = archivos
        .filter((item) => {
            const tipo = String(item.tipo || "").toLowerCase();

            const archivo =
                item.archivo ||
                item.Archivo ||
                {};

            const nombre = String(
                archivo.nombre || ""
            ).toLowerCase();

            const url = String(
                archivo.url || ""
            ).toLowerCase();

            return (
                tipo.includes("fotografia") ||
                tipo.includes("fotografía") ||
                tipo.includes("imagen") ||
                String(archivo.tipo || "").startsWith("image/") ||
                /\.(png|jpe?g|gif|webp)(\?|$)/i.test(nombre) ||
                /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url)
            );
        })
        .map((item, index) => {
            const archivo =
                item.archivo ||
                item.Archivo ||
                {};

            return {
                id: item.id || archivo.id || index,
                url: archivo.url || item.url,
                alt: archivo.nombre || `Evidencia ${index + 1}`
            };
        })
        .filter((item) => item.url);

    // Buscar el acta o informe PDF.
    const informeArchivo = archivos.find((item) => {
        const tipo = String(item.tipo || "").toLowerCase();

        const archivo =
            item.archivo ||
            item.Archivo ||
            {};

        const nombre = String(
            archivo.nombre || ""
        ).toLowerCase();

        const url = String(
            archivo.url || ""
        ).toLowerCase();

        return (
            tipo.includes("acta") ||
            tipo.includes("informe") ||
            nombre.endsWith(".pdf") ||
            /\.pdf(\?|$)/i.test(url)
        );
    });

    const archivoInforme = informeArchivo
        ? informeArchivo.archivo ||
          informeArchivo.Archivo ||
          {}
        : null;

    const informeUrl = archivoInforme?.url || null;

    const informeNombre =
        archivoInforme?.nombre ||
        "Informe de visita.pdf";

    const miniaturas = evidencias.slice(
        0,
        MAX_MINIATURAS
    );

    const restantes = Math.max(
        evidencias.length - MAX_MINIATURAS,
        0
    );

    return (
        <div>
            <div className="mx-auto flex max-w-6xl flex-col gap-4 p-2 sm:p-6 lg:h-[calc(100vh-6rem)]">
                {/* Encabezado */}
                <div className="flex flex-none items-center justify-between gap-4">
                    <button
                        type="button"
                        onClick={handleRegresar}
                        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-gray-300 hover:text-gray-900"
                    >
                        <ArrowLeft size={16} />
                        Regresar
                    </button>

                    <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                        Visita Empresarial
                    </h1>

                    <div className="hidden w-[110px] sm:block" />
                </div>

                <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-12">
                    {/* Columna izquierda: datos generales */}
                    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:col-span-4">
                        <div className="flex-none bg-gradient-to-br from-red-500 to-red-600 px-5 py-5 text-white">
                            <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-white/30 bg-white/20">
                                {fotoEmpresa ? (
                                    <img
                                        src={fotoEmpresa}
                                        alt={`Logo de ${nombreEmpresa}`}
                                        className="h-full w-full object-contain bg-white"
                                        onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <Building2 size={26} />
                                )}
                            </div>

                            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                                Empresa visitada
                            </p>

                            <p className="text-lg font-bold leading-tight">
                                {nombreEmpresa}
                            </p>
                        </div>

                        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
                            <InfoItem
                                icon={Hash}
                                label={
                                    codigos.length > 1
                                        ? "Códigos de los practicantes"
                                        : "Código del practicante"
                                }
                                value={codigoPracticante}
                            />

                            <InfoItem
                                icon={CalendarDays}
                                label="Fecha de visita"
                                value={formatearFecha(fechaVisita)}
                            />

                            <InfoItem
                                icon={Clock}
                                label="Hora"
                                value={formatearHora(horaVisita)}
                            />

                            {registroVisita.fecha_realizada && (
                                <InfoItem
                                    icon={CalendarCheck}
                                    label="Visita realizada el"
                                    value={formatearFecha(
                                        registroVisita.fecha_realizada
                                    )}
                                />
                            )}

                            {/* Tutor docente responsable */}
                            <div className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                                <InfoItem
                                    icon={GraduationCap}
                                    label="Tutor docente responsable"
                                    value={nombreTutor}
                                />

                                {detalleTutor && (
                                    <p className="mt-1 pl-12 text-xs text-gray-500">
                                        {detalleTutor}
                                    </p>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Columna derecha: descripción, evidencias e informe */}
                    <section className="flex min-h-0 flex-col gap-4 lg:col-span-8">
                        {/* Descripción */}
                        <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <SectionTitle icon={FileText}>
                                Descripción de la visita
                            </SectionTitle>

                            <div className="min-h-0 flex-1 overflow-y-auto border-l-4 border-red-400 pl-4 pr-2">
                                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                                    {descripcion}
                                </p>
                            </div>
                        </div>

                        {/* Evidencias e informe */}
                        <div className="grid flex-none gap-4 md:grid-cols-5">
                            {/* Evidencias fotográficas */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-3">
                                <SectionTitle icon={ImageIcon}>
                                    Evidencias fotográficas

                                    {evidencias.length > 0 && (
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
                                            {evidencias.length}
                                        </span>
                                    )}
                                </SectionTitle>

                                {evidencias.length === 0 ? (
                                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                                        Sin evidencia fotográfica registrada.
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                        {miniaturas.map((imagen, index) => {
                                            const esUltima =
                                                index === MAX_MINIATURAS - 1 &&
                                                restantes > 0;

                                            return (
                                                <button
                                                    type="button"
                                                    key={imagen.id}
                                                    onClick={() =>
                                                        setLightboxIndex(index)
                                                    }
                                                    className="group relative h-24 overflow-hidden rounded-xl border border-gray-100"
                                                >
                                                    <img
                                                        src={imagen.url}
                                                        alt={imagen.alt}
                                                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                    />

                                                    {esUltima ? (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-bold text-white">
                                                            +{restantes}
                                                        </div>
                                                    ) : (
                                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Informe de visita */}
                            <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:col-span-2">
                                <SectionTitle icon={FileText}>
                                    Informe de visita
                                </SectionTitle>

                                {!informeUrl ? (
                                    <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                                        No hay un informe adjunto.
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setPdfOpen(true)}
                                        className="group flex h-24 w-full items-center gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3 text-left transition hover:border-red-300 hover:bg-red-50"
                                    >
                                        <div className="flex h-12 w-10 flex-none items-center justify-center rounded-md border border-gray-200 bg-white">
                                            <FileText
                                                size={20}
                                                className="text-red-500"
                                            />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-red-600">
                                                {informeNombre}
                                            </p>

                                            <p className="mt-0.5 text-xs text-gray-400">
                                                Clic para visualizar
                                            </p>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Visor de fotografías */}
            <ImageLightbox
                images={evidencias}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onChange={setLightboxIndex}
            />

            {/* Visor del informe PDF */}
            <PdfPreviewModal
                open={pdfOpen}
                onClose={() => setPdfOpen(false)}
                fileUrl={informeUrl}
                fileName={informeNombre}
            />
        </div>
    );
}
