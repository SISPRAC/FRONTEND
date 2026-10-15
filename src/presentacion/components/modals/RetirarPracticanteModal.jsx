import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast"; // o: import { toast } from "sonner";
import {
  X,
  Upload,
  CheckCircle2,
  FileText,
  Download,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
} from "lucide-react";

const MAX_SIZE_MB = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function truncarNombreArchivo(nombre, maxLength = 22) {
  if (!nombre) return "";
  if (nombre.length <= maxLength) return nombre;

  const puntoIndex = nombre.lastIndexOf(".");
  const extension = puntoIndex !== -1 ? nombre.slice(puntoIndex) : "";
  const base = puntoIndex !== -1 ? nombre.slice(0, puntoIndex) : nombre;

  const espacioDisponible = maxLength - extension.length - 3;

  if (espacioDisponible <= 0) return `...${extension}`;

  return `${base.slice(0, espacioDisponible)}...${extension}`;
}

function esPdf(file) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

export default function RetirarPracticanteModal({
  practicante,
  open = true,
  onClose = () => {},
  onRetirar = () => {},
  urlPlantilla = "#",
  mostrarDatosVacante = false,
}) {
  const [motivo, setMotivo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mostrarVista, setMostrarVista] = useState(true);
  const [retirando, setRetirando] = useState(false);
  const [errores, setErrores] = useState({
    motivo: false,
    archivo: false,
  });

  const inputRef = useRef(null);

  // Vacía todo el formulario.
  const resetFormulario = () => {
    setMotivo("");
    setArchivo(null);
    setPreviewUrl(null);
    setMostrarVista(true);
    setRetirando(false);
    setErrores({ motivo: false, archivo: false });

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Cierra el modal y limpia el formulario.
  const handleCerrar = () => {
    if (retirando) return;
    resetFormulario();
    onClose();
  };

  // Limpia el formulario si el padre cierra el modal.
  useEffect(() => {
    if (!open) resetFormulario();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Crea y libera la URL temporal de la vista previa del PDF.
  useEffect(() => {
    if (!archivo) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(archivo);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  if (!open) return null;

  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];

    // Permite seleccionar nuevamente el mismo archivo.
    e.target.value = "";

    if (!file) return;

    if (!esPdf(file)) {
      toast.error("Solo se permiten archivos PDF", { id: "retiro-error" });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      const pesoMb = (file.size / (1024 * 1024)).toFixed(2);

      toast.error(
        `El archivo no debe pesar más de ${MAX_SIZE_MB} MB (pesa ${pesoMb} MB)`,
        { id: "retiro-error" }
      );
      return;
    }

    setArchivo(file);
    setMostrarVista(true);
    setErrores((prev) => ({ ...prev, archivo: false }));
  };

  const handleRetirar = async () => {
    if (retirando) return;

    const nuevosErrores = {
      motivo: !motivo.trim(),
      archivo: !archivo,
    };

    setErrores(nuevosErrores);

    if (nuevosErrores.motivo && nuevosErrores.archivo) {
      toast.error("El motivo y el formato de retiro son obligatorios", {
        id: "retiro-error",
      });
      return;
    }

    if (nuevosErrores.motivo) {
      toast.error("El motivo es obligatorio", { id: "retiro-error" });
      return;
    }

    if (nuevosErrores.archivo) {
      toast.error("Debes subir el formato de retiro (PDF)", {
        id: "retiro-error",
      });
      return;
    }

    setRetirando(true);

    try {
      // Si onRetirar devuelve una promesa, esperamos a que termine.
      await onRetirar({
        motivo: motivo.trim(),
        archivo,
      });
    } finally {
      setRetirando(false);
    }
  };

  const conVista = Boolean(archivo && mostrarVista && previewUrl);

  const nombreCompleto = mostrarDatosVacante
    ? `${practicante?.nombres ?? ""} ${practicante?.apellidos ?? ""}`.trim()
    : practicante?.candidatos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4">
      <div
        className={`flex max-h-[95vh] w-full flex-col overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl transition-all duration-300 sm:rounded-[40px] sm:p-7 ${
          conVista ? "max-w-md md:max-w-3xl" : "max-w-md"
        }`}
      >
        {/* Encabezado */}
        <div className="relative mb-6 shrink-0">
          <h2 className="text-center text-xl font-bold text-gray-800 sm:text-2xl">
            Retirar Practicante
          </h2>

          <button
            type="button"
            onClick={handleCerrar}
            disabled={retirando}
            className="absolute right-0 top-0 rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>

        <div
          className={`grid grid-cols-1 gap-x-6 ${
            conVista ? "md:grid-cols-2" : ""
          }`}
        >
          {/* Campos del formulario */}
          <div className="md:col-start-1 md:row-start-1">
            {/* Datos del practicante */}
            <div className="mb-4 space-y-2 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Nombre:</span>{" "}
                {nombreCompleto || "Sin nombre"}
              </p>

              {mostrarDatosVacante ? (
                <>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Correo:</span>{" "}
                    {practicante?.correo || "Sin correo"}
                  </p>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Vacante:</span>{" "}
                    {practicante?.apertura?.vacante?.trim() ||
                      "Sin vacante asignada"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Código:</span>{" "}
                    {practicante?.codigo ?? "Sin código"}
                  </p>

                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Empresa:</span>{" "}
                    {practicante?.empresa ?? "Sin empresa asignada"}
                  </p>
                </>
              )}
            </div>

            {/* Motivo */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-bold text-gray-800">
                Motivo <span className="text-red-500">*</span>
              </label>

              <textarea
                value={motivo}
                disabled={retirando}
                onChange={(e) => {
                  setMotivo(e.target.value);

                  if (errores.motivo && e.target.value.trim()) {
                    setErrores((prev) => ({
                      ...prev,
                      motivo: false,
                    }));
                  }
                }}
                placeholder="Introduce el motivo"
                rows={3}
                className={`w-full resize-none rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition focus:ring-2 disabled:opacity-60 ${
                  errores.motivo
                    ? "bg-red-50 ring-2 ring-red-500 placeholder-red-300 focus:ring-red-500"
                    : "bg-gray-100 ring-1 ring-transparent placeholder-gray-400 focus:ring-red-400"
                }`}
              />

              {errores.motivo && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  El motivo es obligatorio
                </p>
              )}
            </div>

            {/* Formato de retiro */}
            <div className="mb-2">
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Formato retiro practicante:{" "}
                <span className="text-red-500">*</span>
              </label>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleArchivoChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={retirando}
                title={archivo ? archivo.name : undefined}
                className={`flex w-full items-center justify-center rounded-xl border-2 px-4 py-3 transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  archivo
                    ? "border-red-300 bg-red-50 text-gray-700"
                    : errores.archivo
                      ? "border-red-500 bg-red-50 text-red-500"
                      : "border-gray-300 bg-white text-gray-500 hover:border-red-300 hover:bg-red-50"
                }`}
              >
                {archivo ? (
                  <div className="relative flex w-full items-center justify-center">
                    <span className="max-w-[80%] truncate text-sm font-medium">
                      {truncarNombreArchivo(archivo.name)}
                    </span>

                    <CheckCircle2
                      size={20}
                      className="absolute right-0 fill-emerald-500 text-white"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload size={18} />

                    <span className="text-sm font-medium">
                      Subir formato de retiro
                    </span>
                  </div>
                )}
              </button>

              <p
                className={`mt-1.5 text-center text-xs ${
                  errores.archivo && !archivo
                    ? "font-medium text-red-600"
                    : "text-gray-400"
                }`}
              >
                {errores.archivo && !archivo
                  ? "El formato de retiro es obligatorio · "
                  : ""}
                Solo PDF, máx. {MAX_SIZE_MB} MB
              </p>

              {/* Mostrar u ocultar vista previa */}
              {archivo && (
                <div className="mt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setMostrarVista((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
                  >
                    {mostrarVista ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}

                    {mostrarVista
                      ? "Ocultar vista previa"
                      : "Ver vista previa"}
                  </button>
                </div>
              )}

              {/* Descargar plantilla */}
              <div className="mt-2 flex justify-center">
                <a
                  href={urlPlantilla}
                  download
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  <FileText size={14} />
                  Plantilla de retiro de practicante
                  <Download size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Vista previa del PDF */}
          {conVista && (
            <div className="relative mt-4 md:col-start-2 md:row-span-2 md:row-start-1 md:mt-0">
              <div className="flex h-[50vh] min-h-[280px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 md:absolute md:inset-0 md:h-auto md:min-h-0">
                <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2">
                  <span className="truncate text-xs font-semibold text-gray-700">
                    {archivo.name}
                  </span>

                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    Abrir <ExternalLink size={12} />
                  </a>
                </div>

                <object
                  data={`${previewUrl}#view=FitH`}
                  type="application/pdf"
                  className="min-h-0 w-full flex-1"
                >
                  <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
                    <FileText size={36} className="text-gray-400" />

                    <p className="text-sm text-gray-600">
                      Tu navegador no puede mostrar el PDF aquí.
                    </p>

                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#e8192c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#c8111f]"
                    >
                      Abrir PDF
                    </a>
                  </div>
                </object>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="mt-4 flex gap-3 md:col-start-1 md:row-start-2">
            <button
              type="button"
              onClick={handleRetirar}
              disabled={retirando}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#e8192c] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8111f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100"
            >
              {retirando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Retirando...
                </>
              ) : (
                "Retirar"
              )}
            </button>

            <button
              type="button"
              onClick={handleCerrar}
              disabled={retirando}
              className="flex-1 rounded-full bg-gray-200 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}