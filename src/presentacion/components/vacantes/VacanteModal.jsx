import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  normalizarCargo,
  normalizarDescripcion,
} from "../utils/normalizarTexto"; // ajusta la ruta

const MIN_TITULO = 5;
const MAX_TITULO = 80;
const MAX_DESCRIPCION = 1000;

const inputClass = (hasError) =>
  `w-full rounded-md border px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
    hasError
      ? "border-red-500 bg-red-50 focus:ring-red-200"
      : "border-slate-300 focus:ring-slate-300"
  }`;

// "Disponible" / "DISPONIBLE" -> "DISPONIBLE"
const estadoAValor = (estado) =>
  String(estado ?? "DISPONIBLE").toUpperCase() === "CERRADA"
    ? "CERRADA"
    : "DISPONIBLE";

export default function VacanteModal({
  modo = "crear", // "crear" | "editar"
  vacante = null, // vacante a editar (null al crear)
  cargando = false,
  onSubmit, // recibe { nombre, descripcion, estado? }
  onClose,
}) {
  const esEdicion = modo === "editar";

  const [form, setForm] = useState({
    nombre: vacante?.nombre ?? "",
    descripcion: vacante?.descripcion ?? "",
    estado: estadoAValor(vacante?.estado),
  });
  const [errors, setErrors] = useState({});

  // Cerrar con Escape (si no está guardando)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !cargando && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cargando, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cargando) return;

    const nombre = normalizarCargo(form.nombre);
    const descripcion = normalizarDescripcion(form.descripcion);

    const nuevosErrores = {};

    if (nombre.length < MIN_TITULO) {
      nuevosErrores.nombre = `El nombre debe tener mínimo ${MIN_TITULO} caracteres`;
    } else if (nombre.length > MAX_TITULO) {
      nuevosErrores.nombre = `El nombre no puede superar ${MAX_TITULO} caracteres`;
    }

    if (!descripcion) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    } else if (descripcion.length > MAX_DESCRIPCION) {
      nuevosErrores.descripcion = `La descripción no puede superar ${MAX_DESCRIPCION} caracteres`;
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrors(nuevosErrores);
      toast.error(Object.values(nuevosErrores)[0]);
      return;
    }

    // Deja el formulario ya normalizado y manda los datos limpios
    setForm((prev) => ({ ...prev, nombre, descripcion }));

    onSubmit({
      nombre,
      descripcion,
      ...(esEdicion && { estado: form.estado }),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={() => !cargando && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-5 text-xl font-bold text-slate-800">
          {esEdicion ? "Editar vacante" : "Crear vacante"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* NOMBRE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nombre
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={() =>
                setForm((p) => ({ ...p, nombre: normalizarCargo(p.nombre) }))
              }
              maxLength={MAX_TITULO}
              placeholder="Ej: Practicante de Desarrollo de Software"
              className={inputClass(errors.nombre)}
            />
            <div className="mt-0.5 flex justify-between text-[11px]">
              <span className="text-red-600">{errors.nombre}</span>
              <span className="text-slate-400">
                {form.nombre.length}/{MAX_TITULO}
              </span>
            </div>
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              onBlur={() =>
                setForm((p) => ({
                  ...p,
                  descripcion: normalizarDescripcion(p.descripcion),
                }))
              }
              maxLength={MAX_DESCRIPCION}
              rows={5}
              placeholder="Describa las funciones, requisitos y características de la vacante"
              className={`${inputClass(errors.descripcion)} resize-none`}
            />
            <div className="mt-0.5 flex justify-between text-[11px]">
              <span className="text-red-600">{errors.descripcion}</span>
              <span
                className={
                  form.descripcion.length >= MAX_DESCRIPCION * 0.9
                    ? "text-red-500"
                    : "text-slate-400"
                }
              >
                {form.descripcion.length}/{MAX_DESCRIPCION}
              </span>
            </div>
          </div>

          {/* ESTADO (solo editar) */}
          {esEdicion && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="DISPONIBLE">Disponible</option>
                <option value="CERRADA">Cerrada</option>
              </select>
            </div>
          )}

          {/* CONVENIO (solo editar, solo lectura) */}
          {esEdicion && vacante?.Convenio && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Convenio
              </label>
              <div className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600">
                Convenio #{vacante.Convenio.id} - {vacante.Convenio.estado}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                El convenio no puede modificarse.
              </p>
            </div>
          )}

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={cargando}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cargando
                ? "Guardando..."
                : esEdicion
                ? "Guardar cambios"
                : "Crear vacante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}