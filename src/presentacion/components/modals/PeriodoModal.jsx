
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PeriodoModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  periodo,
  periodos = []
}) {

  const initialForm = {
    nombre: "",
    fecha_inicio: "",
    fecha_fin: ""
  };

  const currentYear = new Date().getFullYear();
  const opcionesNombre = [`${currentYear}-01`, `${currentYear}-02`];

  const otrosPeriodos = periodos.filter(
    (p) => mode !== "edit" || p.id !== periodo?.id
  );

  const nombresUsados = otrosPeriodos.map((p) => p.nombre);
  const disponibles = opcionesNombre.filter(
    (n) => !nombresUsados.includes(n)
  );

  const toDate = (d) => String(d).slice(0, 10);

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    nombre: false,
    fecha_inicio: false,
    fecha_fin: false,
  });

  useEffect(() => {

    if (!isOpen) return;

    if (mode === "edit" && periodo) {
      setFormData({
        id: periodo.id,
        nombre: periodo.nombre,
        fecha_inicio: toDate(periodo.fecha_inicio),
        fecha_fin: toDate(periodo.fecha_fin),
      });
    }

    if (mode === "create") {
      setFormData({
        ...initialForm,
        nombre: disponibles[0] ?? ""
      });
    }

  }, [mode, periodo, isOpen]);

  const handleClose = () => {
    if (loading) return;

    if (mode !== "edit") {
      setFormData(initialForm);
    }

    onClose();

    setErrors({
      nombre: false,
      fecha_inicio: false,
      fecha_fin: false,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {
      nombre: !formData.nombre.trim(),
      fecha_inicio: !formData.fecha_inicio,
      fecha_fin: !formData.fecha_fin,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      toast.error("Datos requeridos");
      return;
    }

    // 1. Nombre: solo año actual y 01 / 02 (al crear)
    if (mode === "create" && !opcionesNombre.includes(formData.nombre)) {
      setErrors({ ...newErrors, nombre: true });
      toast.error(`El nombre debe ser ${opcionesNombre.join(" o ")}`);
      return;
    }

    // 2. Nombre repetido
    if (nombresUsados.includes(formData.nombre)) {
      setErrors({ ...newErrors, nombre: true });
      toast.error(`Ya existe el período ${formData.nombre}`);
      return;
    }

    const inicio = toDate(formData.fecha_inicio);
    const fin = toDate(formData.fecha_fin);

    // 3. Fin no puede ser antes que inicio
    if (fin < inicio) {
      setErrors({ ...newErrors, fecha_fin: true });
      toast.error("La fecha final no puede ser anterior a la inicial");
      return;
    }

    // 4. No cruzarse con otros períodos
    const choque = otrosPeriodos.find(
      (p) => inicio <= toDate(p.fecha_fin) && fin >= toDate(p.fecha_inicio)
    );

    if (choque) {
      setErrors({ ...newErrors, fecha_inicio: true, fecha_fin: true });
      toast.error(
        `Las fechas se cruzan con el período ${choque.nombre} (${toDate(choque.fecha_inicio)} a ${toDate(choque.fecha_fin)})`
      );
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error("Error al guardar período:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (

    <div className="
      fixed inset-0
      bg-black/40
      flex items-center justify-center
      z-50
    ">

      <div className="
        bg-white
        w-full max-w-lg
        rounded-2xl
        p-8
        shadow-xl
        relative
      ">

        <button
          onClick={handleClose}
          disabled={loading}
          className="
            absolute top-4 right-4
            text-slate-400
            hover:text-red-500
            disabled:opacity-50
          "
        >
          ✕
        </button>

        <h2 className="
          text-2xl
          font-extrabold
          text-slate-800
          mb-6
          text-center
        ">
          {mode === "edit" ? "Editar Período" : "Crear Período"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-semibold">
              Nombre
            </label>

            <select
              value={formData.nombre}
              disabled={loading}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  nombre: e.target.value,
                });

                setErrors({
                  ...errors,
                  nombre: false,
                });
              }}
              className={`border p-2 rounded w-full ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option disabled value="">Seleccione el período</option>

              {opcionesNombre.map((n) => (
                <option
                  key={n}
                  value={n}
                  disabled={nombresUsados.includes(n)}
                >
                  {n}{nombresUsados.includes(n) ? " (ya existe)" : ""}
                </option>
              ))}

              {formData.nombre && !opcionesNombre.includes(formData.nombre) && (
                <option value={formData.nombre}>{formData.nombre}</option>
              )}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">
              Fecha inicial
            </label>

            <input
              type="date"
              value={formData.fecha_inicio}
              disabled={loading}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  fecha_inicio: e.target.value,
                });

                setErrors({
                  ...errors,
                  fecha_inicio: false,
                });
              }}
              className={`border p-2 rounded w-full ${
                errors.fecha_inicio ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">
              Fecha final
            </label>

            <input
              type="date"
              value={formData.fecha_fin}
              disabled={loading}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  fecha_fin: e.target.value,
                });

                setErrors({
                  ...errors,
                  fecha_fin: false,
                });
              }}
              className={`border p-2 rounded w-full ${
                errors.fecha_fin ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="
                px-5 py-2
                rounded-xl
                bg-slate-200
                hover:bg-slate-300
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-5 py-2
                rounded-xl
                bg-[#e8192c]
                text-white
                hover:bg-[#c8111f]
                disabled:opacity-70
                disabled:cursor-not-allowed
              "
            >
              {loading
                ? (mode === "edit" ? "Editando..." : "Creando...")
                : (mode === "edit" ? "Actualizar" : "Crear")}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
