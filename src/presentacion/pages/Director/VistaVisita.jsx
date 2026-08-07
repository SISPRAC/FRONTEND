import React, { useEffect, useState } from "react";
import { ArrowLeft, X, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import Layout from "../../shared/Layouts/Layout";


// -----------------------------------------------------------------------
// Lightbox de imágenes: se abre al hacer clic en una evidencia y permite
// navegar entre todas las fotos antes de cerrarlo.
// -----------------------------------------------------------------------
function ImageLightbox({ images, index, onClose, onChange }) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowRight") onChange((index + 1) % images.length);
            if (e.key === "ArrowLeft") onChange((index - 1 + images.length) % images.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [index, images.length, onChange, onClose]);

    if (index === null) return null;
    const img = images[index];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            >
                <X size={22} />
            </button>

            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length); }}
                    className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:left-8"
                >
                    <ChevronLeft size={24} />
                </button>
            )}

            <img
                src={img.url}
                alt={img.alt || "Evidencia"}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />

            {images.length > 1 && (
                <button
                    onClick={(e) => { e.stopPropagation(); onChange((index + 1) % images.length); }}
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

// -----------------------------------------------------------------------
// Modal de previsualización del informe en PDF, con opción de descarga
// o abrir en una pestaña nueva.
// -----------------------------------------------------------------------
function PdfPreviewModal({ open, onClose, fileUrl, fileName }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <FileText size={17} className="text-red-500" />
                        {fileName || "Informe de visita"}
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={fileUrl}
                            download={fileName}
                            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            <Download size={14} /> Descargar
                        </a>
                        <button
                            onClick={onClose}
                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <iframe title={fileName || "Informe"} src={fileUrl} className="h-full w-full flex-1" />
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Fila etiqueta / valor para los datos generales de la visita.
// -----------------------------------------------------------------------
function InfoRow({ label, value }) {
    return (
        <p className="text-[15px] text-gray-800">
            <span className="font-bold text-gray-900">{label}: </span>
            {value}
        </p>
    );
}

// -----------------------------------------------------------------------
// Página principal. `visita` debe venir de tu base de datos / API con
// la forma:
//   {
//     codigo, nombre, empresa, fecha,
//     evidencias: [{ url, alt }],
//     descripcion,
//     informe: { thumbnailUrl, fileUrl, fileName }
//   }
// -----------------------------------------------------------------------


// Datos de prueba para visualizar la pantalla
const visitaDemo = {
    codigo: "11254",
    nombre: "Carlos Alfredo Linero Sepúlveda",
    empresa: "Tech Solutions S.A.S.",
    fecha: "18 de julio de 2026",
    evidencias: [
        {
            url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
            alt: "Oficina de la empresa",
        },
        {
            url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
            alt: "Área de trabajo",
        },
        {
            url: "https://images.unsplash.com/photo-1497366216548-37526070297c",
            alt: "Instalaciones de la empresa",
        },
    ],
    descripcion:
        "Durante la visita empresarial se realizó el seguimiento al proceso de práctica del aprendiz. Se verificó el cumplimiento de las actividades asignadas, las condiciones del entorno laboral y el avance de las competencias desarrolladas durante la etapa práctica. El tutor empresarial manifestó satisfacción con el desempeño del aprendiz.",
    informe: {
        fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileName: "Informe_Visita_Empresarial.pdf",
        thumbnailUrl: null,
    },
};

export default function VisitaEmpresarialPage({ visita, onRegresar }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    const [pdfOpen, setPdfOpen] = useState(false);

    // Si no llega visita desde el backend, usamos datos de prueba
    const visitaActual = visita || visitaDemo;

    const handleRegresar = () => {
        if (onRegresar) {
            onRegresar();
        } else {
            window.history.back();
        }
    };

    const {
        codigo,
        nombre,
        empresa,
        fecha,
        evidencias = [],
        descripcion,
        informe,
    } = visitaActual;

    return (
        <Layout footerLabel="Director">
            <div className="mx-auto max-w-5xl p-6">
                {/* Botón regresar */}
                <button
                    onClick={handleRegresar}
                    className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                    ← Regresar
                </button>

                {/* Título */}
                <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
                    Visita Empresarial
                </h1>

                {/* Contenedor principal */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">

                    {/* Información general */}
                    <div className="space-y-2">
                        <InfoRow label="Código" value={codigo} />
                        <InfoRow label="Nombre" value={nombre} />
                        <InfoRow label="Empresa" value={empresa} />
                        <InfoRow label="Fecha" value={fecha} />
                    </div>

                    {/* Descripción */}
                    <div className="mt-7">
                        <h2 className="mb-3 text-[15px] font-bold text-gray-900">
                            Descripción de visita
                        </h2>

                        <div className="rounded-xl bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-600">
                            {descripcion || "Sin descripción registrada."}
                        </div>
                    </div>

                    {/* Evidencias */}
                    <div className="mt-7">
                        <h2 className="mb-3 text-[15px] font-bold text-gray-900">
                            Evidencia
                        </h2>

                        {evidencias.length === 0 ? (
                            <p className="text-sm text-gray-400">
                                Sin evidencia fotográfica.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {evidencias.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setLightboxIndex(i)}
                                        className="group relative aspect-square overflow-hidden rounded-xl border border-gray-100"
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.alt || `Evidencia ${i + 1}`}
                                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                        />

                                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* Informe PDF */}
                    {informe?.fileUrl && (
                        <div className="mt-7">
                            <h2 className="mb-3 text-[15px] font-bold text-gray-900">
                                Informe de visita empresarial
                            </h2>

                            <button
                                onClick={() => setPdfOpen(true)}
                                className="group flex w-full items-center gap-4 rounded-xl border border-gray-100 bg-red-50/40 p-4 text-left hover:border-red-200"
                            >
                                <div className="flex h-16 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white">
                                    {informe.thumbnailUrl ? (
                                        <img
                                            src={informe.thumbnailUrl}
                                            alt="Vista previa del informe"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <FileText size={22} className="text-red-400" />
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-red-600">
                                        {informe.fileName || "Ver informe"}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        Clic para previsualizar
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox */}
            <ImageLightbox
                images={evidencias}
                index={lightboxIndex}
                onClose={() => setLightboxIndex(null)}
                onChange={setLightboxIndex}
            />

            {/* Modal PDF */}
            <PdfPreviewModal
                open={pdfOpen}
                onClose={() => setPdfOpen(false)}
                fileUrl={informe?.fileUrl}
                fileName={informe?.fileName}
            />
        </Layout >
    );
}