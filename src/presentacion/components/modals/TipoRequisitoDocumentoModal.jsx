
import { useEffect, useState } from "react";
import {
    X,
    FileText,
    Upload,
    Loader2,
    Trash2,
    RefreshCw,
    Lock
} from "lucide-react";
import { toast } from "react-hot-toast";

const ROL_PRACTICANTE_ID = 4;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const NOMBRES_DOCUMENTOS_FIJOS = [
    "Plan de Trabajo",
    "Informe Parcial",
    "Informe Final",
];

const estadoInicial = {
    nombre: "",
    descripcion: "",
    rol_id: ROL_PRACTICANTE_ID,
    obligatorio: true,
    estado: true,
    archivo: null,
};

const esPdf = (file) =>
    file?.type === "application/pdf" || /\.pdf$/i.test(file?.name || "");

const normalizar = (texto = "") =>
    texto
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

/* ---------- Visor PDF ---------- */
function VisorPdf({ src }) {
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setCargando(true);
        setError(false);
    }, [src]);

    return (
        <div className="relative flex-1 min-h-0">
            {cargando && !error && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Cargando vista previa...
                </div>
            )}

            {error ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                    <FileText size={35} className="text-red-400" />
                    <p className="text-sm font-medium text-gray-700">
                        No fue posible visualizar el PDF.
                    </p>
                    <p className="text-xs text-gray-500">
                        Verifica que el archivo esté disponible y que el
                        almacenamiento permita visualizarlo en el navegador.
                    </p>
                </div>
            ) : (
                <iframe
                    key={src}
                    src={src}
                    title="Vista previa de la plantilla PDF"
                    onLoad={() => setCargando(false)}
                    onError={() => {
                        setCargando(false);
                        setError(true);
                    }}
                    className="h-full w-full bg-white"
                />
            )}
        </div>
    );
}

export default function TipoRequisitoDocumentoModal({
    isOpen,
    onClose,
    onSubmit,
    requisito,
    requisitos = [],
    guardando = false,
}) {
    const [formData, setFormData] = useState(estadoInicial);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [conPlantilla, setConPlantilla] = useState(false);
    const [arrastrando, setArrastrando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    const esEdicion = !!requisito;
    const ocupado = guardando || enviando;

    const plantillaActual = requisito?.plantilla?.url
        ? requisito.plantilla
        : null;

    // Determinar si el nombre es uno de los documentos protegidos.
    const nombreBloqueado =
        esEdicion &&
        NOMBRES_DOCUMENTOS_FIJOS.some(
            (nombre) =>
                normalizar(nombre) === normalizar(requisito?.nombre)
        );

    // Inicializar formulario.
    useEffect(() => {
        if (!isOpen) return;

        if (requisito) {
            setFormData({
                id: requisito.id,
                nombre: requisito.nombre || "",
                descripcion: requisito.descripcion || "",
                rol_id: ROL_PRACTICANTE_ID,
                obligatorio: requisito.obligatorio ?? true,
                estado: requisito.estado ?? true,
                archivo: null,
            });

            setConPlantilla(!!requisito.plantilla?.url);
        } else {
            setFormData({
                ...estadoInicial,
                archivo: null,
            });

            setConPlantilla(false);
        }

        setArchivoSeleccionado(null);
        setArrastrando(false);
        setEnviando(false);
    }, [isOpen, requisito]);

    // Generar URL temporal para visualizar el PDF recién seleccionado.
    useEffect(() => {
        if (!archivoSeleccionado) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(archivoSeleccionado);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [archivoSeleccionado]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Validar y procesar PDF.
    const procesarArchivo = (file) => {
        if (!file) return;

        if (!esPdf(file)) {
            toast.error("Solo se permiten archivos PDF.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                "El PDF es demasiado pesado. El tamaño máximo es de 2MB."
            );
            return;
        }

        setArchivoSeleccionado(file);

        setFormData((prev) => ({
            ...prev,
            archivo: file,
        }));
    };

    const handleFileChange = (e) => {
        procesarArchivo(e.target.files?.[0]);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setArrastrando(false);

        if (ocupado) return;

        procesarArchivo(e.dataTransfer.files?.[0]);
    };

    const quitarArchivo = () => {
        setArchivoSeleccionado(null);

        setFormData((prev) => ({
            ...prev,
            archivo: null,
        }));
    };

    const handleTogglePlantilla = (e) => {
        const activo = e.target.checked;

        setConPlantilla(activo);

        if (!activo) {
            quitarArchivo();
        }
    };

    // Guardar requisito.
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Si es un documento protegido, conservar su nombre original.
        const nombre = nombreBloqueado
            ? requisito.nombre
            : formData.nombre.trim();

        if (!nombre) {
            toast.error("El nombre del documento es obligatorio.");
            return;
        }

        if (!formData.descripcion.trim()) {
            toast.error("La descripción es obligatoria.");
            return;
        }

        const repetido = requisitos.some(
            (r) =>
                Number(r.rol_id) === ROL_PRACTICANTE_ID &&
                r.id !== formData.id &&
                normalizar(r.nombre) === normalizar(nombre)
        );

        if (repetido) {
            toast.error("Ya existe un documento con ese nombre.");
            return;
        }

        if (
            conPlantilla &&
            !archivoSeleccionado &&
            !plantillaActual
        ) {
            toast.error("Selecciona un PDF o desactiva la plantilla.");
            return;
        }

        try {
            setEnviando(true);

            await onSubmit({
                ...formData,
                nombre,
                rol_id: ROL_PRACTICANTE_ID,
                archivo: conPlantilla ? formData.archivo : null,
            });
        } finally {
            setEnviando(false);
        }
    };

    // Datos del visor.
    const nombreVisor =
        archivoSeleccionado?.name ||
        plantillaActual?.nombre ||
        null;

    const fuenteVisor = archivoSeleccionado
        ? previewUrl
        : plantillaActual?.url || null;

    const hayPdf = !!nombreVisor && !!fuenteVisor;

    const inputPdf = (
        <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={ocupado}
            className="hidden"
        />
    );

    const botonTexto = ocupado ? "Guardando..." : "Guardar";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div
                className={`w-full rounded-2xl bg-white shadow-xl transition-all ${
                    conPlantilla ? "max-w-5xl" : "max-w-xl"
                }`}
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-gray-800">
                            {esEdicion
                                ? "Editar requisito documental"
                                : "Nuevo requisito documental"}
                        </h2>

                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            Dirigido a: Practicante
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={ocupado}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div
                        className={`grid grid-cols-1 gap-6 ${
                            conPlantilla ? "md:grid-cols-5" : ""
                        }`}
                    >
                        {/* Columna izquierda */}
                        <div className="space-y-4 md:col-span-2">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Nombre del documento
                                    <span className="text-red-500"> *</span>
                                </label>

                                <input
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej. Hoja de vida"
                                    required
                                    disabled={ocupado || nombreBloqueado}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100 ${
                                        nombreBloqueado
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500"
                                            : "border-gray-300"
                                    }`}
                                />

                                {nombreBloqueado && (
                                    <p className="mt-1.5 flex items-center gap-1 text-xs text-amber-600">
                                        <Lock size={13} />
                                        Este nombre es fijo y no puede modificarse.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Descripción
                                    <span className="text-red-500"> *</span>
                                </label>

                                <textarea
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    rows={conPlantilla ? 6 : 4}
                                    placeholder="Describe el documento que debe entregar el practicante..."
                                    required
                                    disabled={ocupado}
                                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
                                    <input
                                        type="checkbox"
                                        name="obligatorio"
                                        checked={formData.obligatorio}
                                        onChange={handleChange}
                                        disabled={ocupado}
                                        className="h-4 w-4 accent-red-600"
                                    />

                                    <span className="text-sm font-medium text-gray-700">
                                        Obligatorio
                                    </span>
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3">
                                    <input
                                        type="checkbox"
                                        name="estado"
                                        checked={formData.estado}
                                        onChange={handleChange}
                                        disabled={ocupado}
                                        className="h-4 w-4 accent-red-600"
                                    />

                                    <span className="text-sm font-medium text-gray-700">
                                        Activo
                                    </span>
                                </label>
                            </div>

                            {/* Incluir plantilla */}
                            {!plantillaActual && (
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-red-200 bg-red-50/40 p-3">
                                    <input
                                        type="checkbox"
                                        checked={conPlantilla}
                                        onChange={handleTogglePlantilla}
                                        disabled={ocupado}
                                        className="h-4 w-4 accent-red-600"
                                    />

                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-700">
                                            Incluir plantilla (PDF)
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            El practicante podrá descargarla como guía.
                                        </span>
                                    </div>
                                </label>
                            )}
                        </div>

                        {/* Columna derecha */}
                        {conPlantilla && (
                            <div className="flex flex-col md:col-span-3">
                                <div className="mb-1.5 flex items-center justify-between gap-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Plantilla del documento
                                    </label>

                                    {hayPdf && (
                                        <div className="flex items-center gap-2">
                                            {archivoSeleccionado && (
                                                <button
                                                    type="button"
                                                    onClick={quitarArchivo}
                                                    disabled={ocupado}
                                                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                >
                                                    <Trash2 size={14} />
                                                    Quitar
                                                </button>
                                            )}

                                            <label
                                                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 ${
                                                    ocupado
                                                        ? "pointer-events-none opacity-50"
                                                        : ""
                                                }`}
                                            >
                                                <RefreshCw size={14} />
                                                Cambiar PDF
                                                {inputPdf}
                                            </label>
                                        </div>
                                    )}
                                </div>

                                <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                    {hayPdf ? (
                                        <>
                                            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                                                <FileText
                                                    size={15}
                                                    className="shrink-0 text-red-500"
                                                />

                                                <span className="min-w-0 flex-1 truncate">
                                                    {nombreVisor}
                                                </span>

                                                {archivoSeleccionado && (
                                                    <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-green-700">
                                                        Nuevo
                                                    </span>
                                                )}
                                            </div>

                                            <VisorPdf src={fuenteVisor} />
                                        </>
                                    ) : (
                                        <label
                                            onDragOver={(e) => {
                                                e.preventDefault();

                                                if (!ocupado) {
                                                    setArrastrando(true);
                                                }
                                            }}
                                            onDragLeave={() =>
                                                setArrastrando(false)
                                            }
                                            onDrop={handleDrop}
                                            className={`m-3 flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 text-center transition ${
                                                arrastrando
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-300 bg-white hover:border-red-400 hover:bg-red-50/30"
                                            }`}
                                        >
                                            <div className="rounded-full bg-red-50 p-3">
                                                <Upload
                                                    size={26}
                                                    className="text-red-500"
                                                />
                                            </div>

                                            <span className="text-sm font-medium text-gray-700">
                                                {arrastrando
                                                    ? "Suelta el PDF aquí"
                                                    : "Arrastra tu PDF aquí"}
                                            </span>

                                            <span className="text-xs text-gray-500">
                                                o haz clic para seleccionarlo
                                            </span>

                                            <span className="mt-1 rounded-full bg-gray-100 px-3 py-0.5 text-[11px] text-gray-500">
                                                Solo PDF · Máximo 2MB
                                            </span>

                                            {inputPdf}
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={ocupado}
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={ocupado}
                            className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {ocupado && (
                                <Loader2
                                    size={17}
                                    className="animate-spin"
                                />
                            )}

                            {botonTexto}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
