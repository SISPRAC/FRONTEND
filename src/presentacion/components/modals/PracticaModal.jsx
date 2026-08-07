import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { periodoRepository } from "../../../infraestructura/repository/periodoRepository.js";
import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos.js";

import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";

export default function PracticaModal({
  isOpen,
  onClose,
  onSubmit,
  mode,
  practica,
  practicas
}) {

  const initialForm = {
    periodo_id: "",
    fecha_inicio: "",
    fecha_fin: ""
  };

  const [formData, setFormData] = useState(initialForm);

  const [periodos, setPeriodos] = useState([]);

  const [errors, setErrors] = useState({
    periodo_id: false,
    fecha_inicio: false,
    fecha_fin: false,
  });

  useEffect(() => {

    if (!isOpen) return;

    loadPeriodos();

    if (mode === "edit" && practica) {

      setFormData({
        id: practica.id,
        periodo_id: practica.periodo_id,
        fecha_inicio: practica.fecha_inicio,
        fecha_fin: practica.fecha_fin,
      });

    }

    if (mode === "create") {
      setFormData(initialForm);
    }

  }, [mode, practica, isOpen]);


  const loadPeriodos = async () => {

    try {

      const data = await getPeriodos({
        periodoRepository
      });

      setPeriodos(data);

    } catch (error) {

      toast.error("Error al cargar los períodos");

    }

  };

  const handleClose = () => {

    if (mode !== "edit") {
      setFormData(initialForm);
    }

    setErrors({
      periodo_id: false,
      fecha_inicio: false,
      fecha_fin: false,
    });

    onClose();

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = {
      periodo_id: !formData.periodo_id,
      fecha_inicio: !formData.fecha_inicio,
      fecha_fin: !formData.fecha_fin,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      toast.error("Datos requeridos");
      return;
    }

    await onSubmit(formData);

  };

  const periodoTienePractica = (id) => {

    if (
      mode === "edit" &&
      Number(formData.periodo_id) === Number(id)
    ) {
      return false;
    }

    return practicas.some(
      practica => Number(practica.periodo_id) === Number(id)
    );

  };

  if (!isOpen) return null;

  return (

    <div
      className="
        fixed inset-0
        bg-black/40
        flex items-center justify-center
        z-50
      "
    >

      <div
        className="
          bg-white
          w-full max-w-lg
          rounded-2xl
          p-8
          shadow-xl
          relative
        "
      >

        <button
          onClick={handleClose}
          className="
            absolute
            top-4
            right-4
            text-slate-400
            hover:text-red-500
          "
        >
          ✕
        </button>

        <h2
          className="
            text-2xl
            font-extrabold
            text-slate-800
            mb-6
            text-center
          "
        >
          {
            mode === "edit"
              ? "Editar Práctica"
              : "Crear Práctica"
          }
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="block mb-1 font-semibold">
              Período
            </label>

            <select
              value={formData.periodo_id}
              onChange={(e) => {

                setFormData({
                  ...formData,
                  periodo_id: e.target.value,
                });

                setErrors({
                  ...errors,
                  periodo_id: false,
                });

              }}
              className={`border p-2 rounded w-full ${errors.periodo_id
                ? "border-red-500"
                : "border-gray-300"
                }`}
            >

              <option value="" disabled>
                Seleccione un período
              </option>

              {
                periodos.map((periodo) => (

                  <option
                    key={periodo.id}
                    value={periodo.id}
                    disabled={periodoTienePractica(periodo.id)}
                  >
                    {periodo.nombre}
                    {periodoTienePractica(periodo.id)
                      ? " (Ya tiene práctica)"
                      : ""}
                  </option>

                ))
              }

            </select>

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
              className={`border p-2 rounded w-full ${errors.fecha_inicio
                ? "border-red-500"
                : "border-gray-300"
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
              className={`border p-2 rounded w-full ${errors.fecha_fin
                ? "border-red-500"
                : "border-gray-300"
                }`}
            />

          </div>

          <div className="flex justify-end gap-3 pt-4">

            <button
              type="button"
              onClick={handleClose}
              className="
                px-5
                py-2
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
                px-5
                py-2
                rounded-xl
                bg-[#e8192c]
                text-white
                hover:bg-[#c8111f]
              "
            >
              {
                mode === "edit"
                  ? "Actualizar"
                  : "Guardar"
              }
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}