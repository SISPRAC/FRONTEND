import { useRef, useState } from "react";
import { X, Upload, CheckCircle2, FileText, Download } from "lucide-react";


function truncarNombreArchivo(nombre, maxLength = 22) {
  if (!nombre) return "";
  if (nombre.length <= maxLength) return nombre;

  const puntoIndex = nombre.lastIndexOf(".");
  const extension = puntoIndex !== -1 ? nombre.slice(puntoIndex) : "";
  const base = puntoIndex !== -1 ? nombre.slice(0, puntoIndex) : nombre;

  const espacioDisponible = maxLength - extension.length - 3; // 3 = "..."
  if (espacioDisponible <= 0) return `...${extension}`;

  return `${base.slice(0, espacioDisponible)}...${extension}`;
}

export default function RetirarPracticanteModal({
  practicante,
  open = true,
  onClose = () => { },
  onRetirar = () => { },
  urlPlantilla = "#", // TODO: reemplazar por la url real del archivo de plantilla
}) {


  const [motivo, setMotivo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const inputRef = useRef(null);

  if (!open) return null;

  const handleArchivoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setArchivo(file);
  };

  const handleRetirar = () => {
    onRetirar({ motivo, archivo });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-[40px] bg-white p-7 shadow-2xl">
        {/* Header */}
        <div className="relative mb-6">
          <h2 className="text-center text-2xl font-bold text-gray-800">
            Retirar Practicante
          </h2>

          <button
            onClick={onClose}
            className="absolute right-0 top-0  rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-red-500"
          >
            <X size={22} />
          </button>
        </div>

        {/* Datos del practicante (traídos automáticamente) */}
        <div className="mb-4 space-y-2 rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Código:</span>{" "}
            {practicante?.codigo}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">Nombre:</span>{" "}
            {practicante?.candidatos}
          </p>

          <p className="text-sm text-gray-700">
            <span className="font-semibold">Empresa:</span>{" "}
            {practicante?.empresa ?? "Sin empresa asignada"}
          </p>
        </div>

        {/* Motivo */}
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-bold text-gray-800">
            Motivo
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Introduce el motivo"
            rows={3}
            className="w-full resize-none rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none ring-1 ring-transparent transition focus:ring-2 focus:ring-red-400"
          />
        </div>

        {/* Formato de retiro (subida de archivo) */}
        <div className="mb-2">
          <label className="mb-2 block text-sm font-bold text-gray-800">
            Formato retiro practicante:
          </label>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            onChange={handleArchivoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            title={archivo ? archivo.name : undefined}
            className={`flex w-full items-center justify-center rounded-xl border-2 px-4 py-3 transition ${archivo
              ? "border-red-300 bg-red-50 text-gray-700"
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

        {/* Botones */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRetirar}
            className="flex-1 rounded-full bg-[#e8192c] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c8111f] active:scale-[0.98]"
          >
            Retirar
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-full bg-gray-200 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-300 active:scale-[0.98]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
