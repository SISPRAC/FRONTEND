
import { X, Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import EstadoBadge from "../estadoBadge/EstadoBadge.jsx";

const formatearFecha = (valor) => {
  if (!valor) return "—";

  const d =
    typeof valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(valor)
      ? new Date(`${valor}T00:00:00`)
      : new Date(valor);

  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
};

const Campo = ({ label, children }) => (
  <div>
    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <div className="text-sm text-slate-700">{children}</div>
  </div>
);

const VerRetiroModal = ({ open, practicante, onClose }) => {
  const [descargando, setDescargando] = useState(false);

  if (!open) return null;

  const retiro = practicante?.retiro ?? null;

  const nombre =
    `${practicante?.nombres ?? ""} ${practicante?.apellidos ?? ""}`.trim() || "—";

  const urlSoporte = retiro?.archivo?.url ?? null;

  const descargarSoporte = async () => {
    if (!urlSoporte || descargando) return;

    try {
      setDescargando(true);

      const respuesta = await fetch(urlSoporte);

      if (!respuesta.ok) {
        throw new Error("No se pudo descargar el archivo");
      }

      const blob = await respuesta.blob();
      const urlTemporal = window.URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = urlTemporal;
      enlace.download = `Soporte_retiro_${nombre.replace(/\s+/g, "_")}.pdf`;

      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();

      window.URL.revokeObjectURL(urlTemporal);
    } catch (error) {
      console.error("Error al descargar el soporte:", error);
      alert("No fue posible descargar el documento. Inténtalo nuevamente.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex h-[95vh] max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">
              Detalle del retiro
            </h3>
            <p className="mt-0.5 text-xs text-slate-400">
              Información y documento de soporte
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={19} />
          </button>
        </div>

        {/* Contenido en dos columnas */}
        {!retiro ? (
          <div className="flex flex-1 items-center justify-center py-16">
            <p className="text-sm text-slate-400">
              No hay información de retiro para este practicante.
            </p>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[0.85fr_1.15fr] lg:overflow-hidden">

            {/* Columna izquierda: Información */}
            <div className="space-y-6 border-b border-slate-100 p-6 lg:overflow-y-auto lg:border-b-0 lg:border-r">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Información del retiro
                </p>

                <div className="space-y-5">
                  <Campo label="Practicante">
                    <p className="font-semibold text-slate-800">{nombre}</p>
                  </Campo>

                  <Campo label="Estado">
                    <EstadoBadge estado={practicante?.estado} size="sm" />
                  </Campo>

                  <Campo label="Fecha del retiro">
                    {formatearFecha(retiro.fecha_retiro)}
                  </Campo>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Motivo del retiro
                </p>

                <p className="min-h-28 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                  {retiro.motivo ?? "—"}
                </p>
              </div>

            

              {!urlSoporte && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
                  <FileText size={30} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">
                    Sin documento adjunto
                  </p>
                </div>
              )}
            </div>

            {/* Columna derecha: Visor PDF */}
            <div className="flex min-h-[400px] flex-col bg-slate-100 p-4 lg:min-h-0">
              <div className="mb-3 flex shrink-0 items-center gap-2">
                <FileText size={17} className="text-slate-500" />
                <p className="text-sm font-bold text-slate-700">
                  Vista previa del documento
                </p>
              </div>

              {urlSoporte ? (
                <div className="min-h-[400px] flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:min-h-0">
                  <iframe
                    src={`${urlSoporte}#toolbar=1&navpanes=0&view=FitH`}
                    title="Soporte del retiro"
                    className="h-full min-h-[400px] w-full lg:min-h-0"
                  />
                </div>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white">
                  <FileText size={45} className="mb-3 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">
                    No hay documento para visualizar
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    No se adjuntó un soporte al retiro.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pie */}
        <div className="flex shrink-0 justify-end border-t border-slate-100 bg-white px-6 py-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerRetiroModal;
