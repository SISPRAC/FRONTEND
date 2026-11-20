import { useEffect } from "react";

export default function ConfirmarCierreModal({
  vacante,
  cargando = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !cargando && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cargando, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !cargando && onCancel()}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-3 text-xl font-bold text-slate-800">
          Cerrar vacante
        </h2>

        <p className="text-sm leading-6 text-slate-600">
          ¿Está seguro de que desea cerrar la vacante{" "}
          <strong>{vacante?.nombre}</strong>?
        </p>

        <p className="mt-2 text-xs text-slate-500">
          La vacante no será eliminada. Se conservará para mantener el
          historial de sus aperturas.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={cargando}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={cargando}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            {cargando ? "Cerrando..." : "Sí, cerrar vacante"}
          </button>
        </div>
      </div>
    </div>
  );
}