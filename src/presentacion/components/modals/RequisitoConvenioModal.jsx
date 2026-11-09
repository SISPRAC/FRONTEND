import { useEffect, useRef, useState } from "react";
import { X, FileText, Upload, Loader2, Trash2, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import { renderAsync } from "docx-preview";

const initialForm = {
    id: null,
    nombre: "",
    descripcion: "",
    tipo_empresa: "",
    obligatorio: true,
    estado: true,
    archivo: null
};

const inputClass =
    "w-full rounded-xl border p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#e8192c] disabled:opacity-60";

const ACCEPT =
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

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
                    ignoreHeight: false
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

            <div ref={contenedorRef} style={{ zoom: 0.62 }} />
        </div>
    );
}

export default function RequisitoConvenioModal({
    isOpen,
    onClose,
    onSubmit,
    requisito,
    mode
}) {
    const [form, setForm] = useState(initialForm);
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    const isEdit = mode === "edit";
    const plantillaActual = requisito?.plantilla || null;

    useEffect(() => {
        if (!isOpen) return;

        setForm(
            requisito
                ? {
                      id: requisito.id,
                      nombre: requisito.nombre ?? "",
                      descripcion: requisito.descripcion ?? "",
                      tipo_empresa: requisito.tipo_empresa ?? "",
                      obligatorio: requisito.obligatorio ?? true,
                      estado: requisito.estado ?? true,
                      archivo: null
                  }
                : initialForm
        );
        setSaving(false);
    }, [isOpen, requisito]);

    // URL temporal para previsualizar PDFs recién seleccionados
    useEffect(() => {
        if (!form.archivo || !esPdf(form.archivo.name)) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(form.archivo);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [form.archivo]);

    if (!isOpen) return null;

    const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const tiposPermitidos = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!tiposPermitidos.includes(file.type)) {
            toast.error("Solo se permiten archivos PDF, Word (.doc) o Word (.docx).");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("El documento es demasiado pesado. El máximo permitido es 2MB.");
            e.target.value = "";
            return;
        }

        set("archivo", file);
        e.target.value = "";
    };

    const quitarArchivo = () => set("archivo", null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        setSaving(true);
        try {
            await onSubmit(form);
        } finally {
            setSaving(false);
        }
    };

    // ---- Qué se muestra en el visor ----
    let nombreVisor = null;
    let fuenteVisor = null; // URL (string) o File

    if (form.archivo) {
        nombreVisor = form.archivo.name;
        fuenteVisor = esPdf(nombreVisor) ? previewUrl : form.archivo;
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
                        accept={ACCEPT}
                        onChange={handleFileChange}
                        disabled={saving}
                        className="hidden"
                    />
                </label>
            );
        }

        if (esPdf(nombreVisor)) return <VisorPdf src={fuenteVisor} />;
        if (esDocx(nombreVisor)) return <VisorDocx source={fuenteVisor} />;

        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-sm text-gray-500">
                <Eye size={30} className="text-gray-300" />
                Los archivos .doc antiguos no tienen vista previa.
                <br />
                Usa un archivo .docx o PDF para poder verlo aquí.
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-5xl rounded-2xl bg-white shadow-xl"
            >
                {/* Encabezado */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-800">
                            {isEdit ? "Editar requisito" : "Nuevo requisito"}
                        </h2>

                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                            Requisito de convenio
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X size={21} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                        {/* Columna izquierda: formulario */}
                        <div className="space-y-4 md:col-span-2">
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    required
                                    maxLength={100}
                                    value={form.nombre}
                                    onChange={(e) => set("nombre", e.target.value)}
                                    placeholder="Ej. Cámara de comercio"
                                    disabled={saving}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Aplica a
                                </label>
                                <select
                                    value={form.tipo_empresa}
                                    onChange={(e) => set("tipo_empresa", e.target.value)}
                                    disabled={saving}
                                    className={inputClass}
                                >
                                    <option value="">Ambas (pública y privada)</option>
                                    <option value="publica">Solo pública</option>
                                    <option value="privada">Solo privada</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Descripción
                                </label>
                                <textarea
                                    rows={4}
                                    maxLength={255}
                                    value={form.descripcion}
                                    onChange={(e) => set("descripcion", e.target.value)}
                                    placeholder="Describe el documento que debe presentar la empresa..."
                                    disabled={saving}
                                    className={`${inputClass} resize-none`}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                                        Obligatorio
                                    </label>
                                    <select
                                        value={String(form.obligatorio)}
                                        onChange={(e) =>
                                            set("obligatorio", e.target.value === "true")
                                        }
                                        disabled={saving}
                                        className={inputClass}
                                    >
                                        <option value="true">Sí</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-semibold text-slate-700">
                                        Estado
                                    </label>
                                    <select
                                        value={String(form.estado)}
                                        onChange={(e) =>
                                            set("estado", e.target.value === "true")
                                        }
                                        disabled={saving}
                                        className={inputClass}
                                    >
                                        <option value="true">Activo</option>
                                        <option value="false">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha: visor de la plantilla */}
                        <div className="flex flex-col md:col-span-3">
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                                <label className="text-sm font-semibold text-slate-700">
                                    Plantilla (opcional)
                                </label>

                                <div className="flex items-center gap-2">
                                    {form.archivo && (
                                        <button
                                            type="button"
                                            onClick={quitarArchivo}
                                            disabled={saving}
                                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                        >
                                            <Trash2 size={14} />
                                            Quitar
                                        </button>
                                    )}

                                    <label
                                        className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 ${
                                            saving ? "pointer-events-none opacity-50" : ""
                                        }`}
                                    >
                                        <Upload size={14} />
                                        {nombreVisor ? "Cambiar archivo" : "Seleccionar archivo"}

                                        <input
                                            type="file"
                                            accept={ACCEPT}
                                            onChange={handleFileChange}
                                            disabled={saving}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex h-[400px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                {nombreVisor && (
                                    <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 text-xs text-gray-600">
                                        <FileText size={15} className="shrink-0 text-red-500" />
                                        <span className="min-w-0 flex-1 truncate">
                                            {nombreVisor}
                                        </span>
                                        {form.archivo && (
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
                            disabled={saving}
                            className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-xl bg-[#e8192c] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && <Loader2 size={17} className="animate-spin" />}
                            {saving
                                ? isEdit ? "Guardando..." : "Creando..."
                                : isEdit ? "Guardar" : "Crear"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}