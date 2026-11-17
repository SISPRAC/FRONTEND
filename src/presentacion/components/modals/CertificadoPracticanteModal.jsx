import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Award,
  Upload,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

// Mismas reglas que el backend (upload en uploadMulter.js)
const TIPOS_PERMITIDOS = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_BYTES = 2 * 1024 * 1024; // 2MB

const formatearTamano = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const formatearFecha = (fecha) => {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "long",
    timeStyle: "short",
  });
};

const CertificadoPracticanteModal = ({
  open,
  practicante,
  certificado,
  loading,
  subiendo,
  formatoUrl,
  onSubir,
  onClose,
}) => {

  const inputRef = useRef(null);

  const [archivo, setArchivo] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const esPdf = archivo?.type === "application/pdf";

  // URL temporal para previsualizar el archivo antes de subirlo
  const previewUrl = useMemo(
    () => (archivo && esPdf ? URL.createObjectURL(archivo) : null),
    [archivo, esPdf]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Limpiar al cerrar el modal o cuando ya quedó subido
  useEffect(() => {
    if (!open || certificado) {
      setArchivo(null);
      setPreviewOpen(false);
    }
  }, [open, certificado]);

  if (!open) return null;

  const nombrePracticante =
    `${practicante?.nombres ?? ""} ${practicante?.apellidos ?? ""}`.trim();

  // ----------------------------------------------------------
  // Selección de archivo + validación
  // ----------------------------------------------------------
  const handleSeleccionar = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      toast.error("Solo se permiten archivos PDF, Word (.doc) o Word (.docx)");
      return;
    }

    if (file.size > MAX_BYTES) {
      toast.error("El archivo no puede superar los 2MB");
      return;
    }

    setArchivo(file);
  };

  const handleConfirmarSubida = async () => {
    if (!archivo || subiendo) return;
    await onSubir(archivo);
    setPreviewOpen(false);
  };

  const handleCerrar = () => {
    if (subiendo) return;
    onClose();
  };

  return (
    <>
      {/* ===================== MODAL PRINCIPAL ===================== */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Award size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Certificado de finalización
                </h3>
                <p className="text-sm text-slate-500">
                  {nombrePracticante || "Practicante"}
                </p>
              </div>
            </div>

            <button
              onClick={handleCerrar}
              disabled={subiendo}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Contenido */}
          <div className="px-6 py-5 space-y-5">

            {/* CARGANDO */}
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
                <Loader2 size={32} className="animate-spin text-emerald-600" />
                <p className="text-sm">Cargando certificado...</p>
              </div>
            )}

            {/* YA EXISTE: SOLO VISUALIZAR */}
            {!loading && certificado && (
              <div className="space-y-4">

                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <CheckCircle2 size={18} />
                  Este practicante ya tiene su certificado cargado.
                </div>

                <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-600 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-700">Archivo: </span>
                    {certificado.nombre ?? "—"}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Fecha de carga: </span>
                    {formatearFecha(certificado.fecha_subida)}
                  </p>
                </div>

                <div className="h-80 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <iframe
                    src={certificado.url}
                    title="Certificado de finalización"
                    className="h-full w-full"
                  />
                </div>

                <div className="flex justify-end">
                  <a
                    href={certificado.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    <ExternalLink size={16} />
                    Abrir en otra pestaña
                  </a>
                </div>

              </div>
            )}

            {/* NO EXISTE: SUBIR */}
            {!loading && !certificado && (
              <div className="space-y-4">

                <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  Este practicante aún no tiene certificado. Una vez cargado
                  <strong> no podrá reemplazarse</strong>, así que revisa el
                  archivo antes de confirmar.
                </div>

                {/* Descargar formato */}
                {formatoUrl && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Formato de certificado
                        </p>
                        <p className="text-xs text-slate-500">
                          Descárgalo, diligéncialo y súbelo aquí.
                        </p>
                      </div>
                    </div>

                    <a
                      href={formatoUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      <Download size={16} />
                      Descargar formato
                    </a>
                  </div>
                )}

                {/* Selector */}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleSeleccionar}
                  className="hidden"
                />

                {!archivo ? (
                  <button
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-10 text-slate-500 hover:border-emerald-400 hover:bg-emerald-50/40 hover:text-emerald-600 transition-colors"
                  >
                    <Upload size={28} />
                    <span className="text-sm font-semibold">
                      Seleccionar certificado
                    </span>
                    <span className="text-xs text-slate-400">
                      PDF, DOC o DOCX · máximo 2MB
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileText size={22} className="shrink-0 text-emerald-600" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {archivo.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatearTamano(archivo.size)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => inputRef.current?.click()}
                        disabled={subiendo}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        Cambiar
                      </button>
                      <button
                        onClick={() => setPreviewOpen(true)}
                        disabled={subiendo}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                      >
                        Revisar y subir
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>
      </div>


      {/* ===================== MODAL DE PREVISUALIZACIÓN ===================== */}
      {previewOpen && archivo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">

          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Revisar certificado
                </h3>
                <p className="text-sm text-slate-500">
                  Verifica que sea el documento correcto antes de subirlo.
                </p>
              </div>

              <button
                onClick={() => setPreviewOpen(false)}
                disabled={subiendo}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Cerrar previsualización"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">

              {esPdf ? (
                <div className="h-[55vh] overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <iframe
                    src={previewUrl}
                    title="Previsualización del certificado"
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 py-16 text-center text-slate-500">
                  <FileText size={36} className="text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    {archivo.name}
                  </p>
                  <p className="max-w-sm text-xs">
                    Los archivos Word no se pueden previsualizar aquí.
                    Ábrelo en tu computador para revisarlo; para evitar
                    problemas recomendamos subir el certificado en PDF.
                  </p>
                </div>
              )}

            </div>

            <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-6 py-4">
              <p className="text-xs text-slate-500">
                {archivo.name} · {formatearTamano(archivo.size)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewOpen(false)}
                  disabled={subiendo}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  Volver
                </button>

                <button
                  onClick={handleConfirmarSubida}
                  disabled={subiendo}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  {subiendo ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Confirmar y subir
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default CertificadoPracticanteModal;