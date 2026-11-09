import { useEffect, useRef, useState } from "react";
import { X, FileText, Upload, Loader2, Trash2, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { renderAsync } from "docx-preview";

const ROL_PRACTICANTE_ID = 4;

const estadoInicial = {
    nombre: "",
    descripcion: "",
    rol_id: ROL_PRACTICANTE_ID,
    obligatorio: true,
    estado: true,
    archivo: null,
};

const esPdf = (nombre = "") => /\.pdf$/i.test(nombre);
const esDocx = (nombre = "") => /\.docx$/i.test(nombre);

/* ---------- Visor de PDF (con spinner mientras carga) ---------- */
function VisorPdf({ src }) {
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        setCargando(true);
    }, [src]);

    return (
        <div className="relative flex-1">
            {cargando && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Cargando vista previa...
                </div>
            )}

            <iframe
                src={src}
                title="Vista previa de la plantilla"
                onLoad={() => setCargando(false)}
                className="h-full w-full bg-white"
            />
        </div>
    );
}

/* ---------- Visor de Word (.docx) renderizado en el navegador ---------- */
function VisorDocx({ source }) {
    const contenedorRef = useRef(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelado = false;

        const renderizar = async () => {
            try {
                setCargando(true);
                setError(false);

                // source puede ser un File (recién seleccionado) o una URL (ya guardado)
                const blob =
                    typeof source === "string"
                        ? await (await fetch(source)).blob()
                        : source;

                if (cancelado || !contenedorRef.current) return;

                contenedorRef.current.innerHTML = "";

                await renderAsync(blob, contenedorRef.current, null, {
                    inWrapper: true,
                    ignoreWidth: false,
                    ignoreHeight: false,
                });
            } catch (err) {
                console.error("Error al mostrar el Word:", err);
                if (!cancelado) setError(true);
            } finally {
                if (!cancelado) setCargando(false);
            }
        };

        renderizar();

        return () => {
            cancelado = true;
        };
    }, [source]);

    return (
        <div className="relative flex-1 overflow-auto bg-gray-100">
            {cargando && (
                <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-white text-sm text-gray-500">
                    <Loader2 size={20} className="animate-spin" />
                    Cargando vista previa...
                </div>
            )}

            {error && (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-gray-500">
                    <Eye size={30} className="text-gray-300" />
                    No se pudo mostrar la vista previa de este documento.
                </div>
            )}

            {/* zoom reduce las páginas para que quepan en el visor */}
            <div ref={contenedorRef} style={{ zoom: 0.62 }} />
        </div>
    );
}

export default function TipoRequisitoDocumentoModal({
    isOpen,
    onClose,
    onSubmit,
    requisito,
    guardando = false,
}) {
    const [formData, setFormData] = useState(estadoInicial);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [enviando, setEnviando] = useState(false);

    const esEdicion = !!requisito;
    const ocupado = guardando || enviando;
    const plantillaActual = requisito?.plantilla || null;

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
        } else {
            setFormData({ ...estadoInicial, archivo: null });
        }

        setArchivoSeleccionado(null);
        setEnviando(false);
    }, [isOpen, requisito]);

    // URL temporal para previsualizar PDFs recién seleccionados
    useEffect(() => {
        if (!archivoSeleccionado || !esPdf(archivoSeleccionado.name)) {
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

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const tiposPermitidos = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        if (!tiposPermitidos.includes(file.type)) {
            toast.error("Solo se permiten archivos PDF, Word (.doc) o Word (.docx).");
            e.target.value = "";
            return;
        }

        const MAX_FILE_SIZE = 2 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                "El documento es demasiado pesado. El tamaño máximo permitido es de 2MB."
            );
            e.target.value = "";
            return;
        }

        setArchivoSeleccionado(file);
        setFormData((prev) => ({ ...prev, archivo: file }));
        e.target.value = "";
    };

    const quitarArchivo = () => {
        setArchivoSeleccionado(null);
        setFormData((prev) => ({ ...prev, archivo: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            toast.error("El nombre del documento es obligatorio.");
            return;
        }

        if (!formData.descripcion.trim()) {
            toast.error("La descripción es obligatoria.");
            return;
        }

        try {
            setEnviando(true);
            await onSubmit({ ...formData, rol_id: ROL_PRACTICANTE_ID });
        } finally {
            setEnviando(false);
        }
    };

    // ---- Qué se muestra en el visor ----
    let nombreVisor = null;
    let fuenteVisor = null; // URL (string) o File

    if (archivoSeleccionado) {
        nombreVisor = archivoSeleccionado.name;
        fuenteVisor = esPdf(nombreVisor) ? previewUrl : archivoSeleccionado;
    } else if (plantillaActual?.url) {
        nombreVisor = plantillaActual.nombre;
        fuenteVisor = plantillaActual.url;
    }

    const renderVisor = () => {
        if (!nombreVisor || !fuenteVisor) {
            return (
                <label className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 px-6 text-center transition hover:bg-red-50/30">
                    <Upload size={30} className="text-gray-300" />
                    <span className="text-sm font-medium text-gray-700">
                        Aún no hay plantilla
                    </span>
                    <span className="text-xs text-gray-500">
                        PDF, DOC o DOCX. Máximo 2MB.
                    </span>

                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileChange}
                        disabled={ocupado}
                        className="hidden"
                    />
                </label>
            );
        }

        if (esPdf(nombreVisor)) {
            return <VisorPdf src={fuenteVisor} />;
        }

        if (esDocx(nombreVisor)) {
            return <VisorDocx source={fuenteVisor} />;
        }

        // .doc antiguo: no se puede mostrar en el navegador
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-gray-500">
                <Eye size={30} className="text-gray-300" />
                Los archivos .doc antiguos no tienen vista previa.
                <br />
                Usa un archivo .docx o PDF para poder verlo aquí.
            </div>
        );
    };

    const botonTexto = ocupado
        ? esEdicion
            ? "Actualizando..."
            : "Creando..."
        : esEdicion
            ? "Actualizar"
            : "Registrar";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
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
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                        {/* Columna izquierda: formulario */}
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
                                    disabled={ocupado}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                />
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
                                    rows={7}
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
                        </div>

                        {/* Columna derecha: visor de la plantilla */}
                        <div className="flex flex-col md:col-span-3">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Plantilla del documento
                                </label>

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
                                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 ${ocupado ? "pointer-events-none opacity-50" : ""
                                            }`}
                                    >
                                        <Upload size={14} />
                                        {nombreVisor ? "Cambiar archivo" : "Seleccionar archivo"}

                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleFileChange}
                                            disabled={ocupado}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                {nombreVisor && (
                                    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                                        <FileText size={15} className="shrink-0 text-red-500" />
                                        <span className="min-w-0 flex-1 truncate">
                                            {nombreVisor}
                                        </span>
                                        {archivoSeleccionado && (
                                            <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-green-700">
                                                Nuevo
                                            </span>
                                        )}
                                    </div>
                                )}

                                {renderVisor()}
                            </div>
                        </div>
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
                            {ocupado && <Loader2 size={17} className="animate-spin" />}
                            {botonTexto}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}