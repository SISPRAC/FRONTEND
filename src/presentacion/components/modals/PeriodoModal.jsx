import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PeriodoModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  periodo
}) {

  const initialForm = {
    nombre: "",
    fecha_inicio: "",
    fecha_fin: ""
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {

    if (!isOpen) return;

    if (mode === "edit" && periodo) {

      setFormData({
        id: periodo.id,
        nombre: periodo.nombre,
        fecha_inicio: periodo.fecha_inicio,
        fecha_fin: periodo.fecha_fin,
      });

    }

    if (mode === "create") {
      setFormData(initialForm);
    }

  }, [mode, periodo, isOpen]);


  const [errors, setErrors] = useState({
    nombre: false,
    fecha_inicio: false,
    fecha_fin: false,
  });

  const handleClose = () => {
    if (mode != "edit") {
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

    const periodoRegex = /^\d{4}-\d{2}$/;

    if (!periodoRegex.test(formData.nombre)) {
      toast.error("El nombre debe tener formato AAAA-NN. Ej: 2026-01");
      return;
    }

    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (

    <div className="
      fixed inset-0
      bg-black/40
      flex items-center justify-center
      z-50
    ">

      {/* caja modal */}
      <div className="
        bg-white
        w-full max-w-lg
        rounded-2xl
        p-8
        shadow-xl
        relative
      ">

        {/* cerrar */}
        <button
          onClick={handleClose}
          className="
            absolute top-4 right-4
            text-slate-400
            hover:text-red-500
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
          {mode === "edit"
            ? "Editar Período"
            : "Crear Período"}
        </h2>

        {/* formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block mb-1 font-semibold">
              Nombre
            </label>

            <input
              type="text"
              value={formData.nombre}
              placeholder="Ingrese el nombre (AAAA-NN)"
              onChange={(e) => {

                let value = e.target.value;

                value = value.replace(/[^0-9-]/g, "");

                setFormData({
                  ...formData,
                  nombre: value,
                });

                setErrors({
                  ...errors,
                  nombre: false,
                });
              }}
              className={`border p-2 rounded w-full ${errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold">
              Fecha inicial
            </label>

            <input
              type="date"
              value={formData.fecha_inicio}
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
              className={`border p-2 rounded w-full ${errors.fecha_inicio ? "border-red-500" : "border-gray-300"
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
              className={`border p-2 rounded w-full ${errors.fecha_fin ? "border-red-500" : "border-gray-300"
                }`}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={handleClose}
              className="
                px-5 py-2
                rounded-xl
                bg-slate-200
                hover:bg-slate-300
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="
                px-5 py-2
                rounded-xl
                bg-[#e8192c]
                text-white
                hover:bg-[#c8111f]
              "
            >
              {mode === "edit"
                ? "Actualizar"
                : "Guardar"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}