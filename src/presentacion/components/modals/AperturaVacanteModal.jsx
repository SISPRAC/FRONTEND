import { useEffect, useState } from "react";

const ESTADO_OPCIONES = [
  "DISPONIBLE",
  "CERRADA"
];

const initialForm = {
  vacante_id: "",
  tutorEmpresa_id: "",
  practica_id: "",
  cupos: 1,
  estado: "DISPONIBLE"
};

export default function AperturaVacanteModal({
  isOpen,
  mode = "crear",
  initialData,
  vacantes = [],
  practicas = [],
  tutores = [],
  onClose,
  onSave
}) {
  
  const [form, setForm] = useState(initialForm);
  const [errores, setErrores] = useState({});


  useEffect(() => {

    if (!isOpen) return;

    if (mode === "editar" && initialData) {

      setForm({
        vacante_id: initialData.vacante_id ?? "",
        tutorEmpresa_id: initialData.tutorEmpresa_id ?? "",
        practica_id: initialData.practica_id ?? "",
        cupos: initialData.cupos ?? 1,
        estado: initialData.estado ?? "DISPONIBLE"
      });

    } else {

      setForm(initialForm);

    }

    setErrores({});

  }, [isOpen, mode, initialData]);


  if (!isOpen) return null;


  const handleChange = (campo, valor) => {

    setForm((prev) => ({
      ...prev,
      [campo]: valor
    }));

  };


  const validar = () => {

    const nuevosErrores = {};


    if (!form.vacante_id) {

      nuevosErrores.vacante_id =
        "Debe seleccionar una vacante.";

    }


    if (!form.tutorEmpresa_id) {

      nuevosErrores.tutorEmpresa_id =
        "Debe seleccionar un tutor empresarial.";

    }


    if (!form.practica_id) {

      nuevosErrores.practica_id =
        "Debe seleccionar una práctica.";

    }


    if (!form.cupos || Number(form.cupos) < 1) {

      nuevosErrores.cupos =
        "Debe existir al menos un cupo.";

    }


    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;

  };


  const handleSubmit = () => {

    if (!validar()) return;


    const payload = {

      vacante_id: Number(form.vacante_id),

      tutorEmpresa_id:
        Number(form.tutorEmpresa_id),

      practica_id:
        Number(form.practica_id),

      cupos:
        Number(form.cupos),

      estado:
        form.estado

    };


    onSave(payload);

  };


  return (

    <div
      className="
        fixed inset-0
        bg-black/40
        flex items-center justify-center
        z-50
        px-4
      "
    >

      <div
        className="
          bg-white
          w-full max-w-md
          rounded-2xl
          p-6
          shadow-xl
        "
      >

        <h2
          className="
            text-xl
            font-bold
            text-slate-800
            mb-5
          "
        >
          {mode === "crear"
            ? "Crear apertura de vacante"
            : "Editar apertura de vacante"}
        </h2>


        <div className="space-y-4">


          {/* VACANTE */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-600
                mb-1
              "
            >
              Vacante <span className="text-red-500">*</span>
            </label>

            <select
              value={form.vacante_id}
              onChange={(e) =>
                handleChange(
                  "vacante_id",
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-slate-300
                rounded-md
                px-3
                py-2
                text-sm
                text-slate-700
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
              "
            >

              <option value="">
                Seleccione una vacante
              </option>

              {vacantes.map((vacante) => (

                <option
                  key={vacante.id}
                  value={vacante.id}
                >
                  {vacante.nombre}
                </option>

              ))}

            </select>

            {errores.vacante_id && (
              <p className="text-xs text-red-500 mt-1">
                {errores.vacante_id}
              </p>
            )}

          </div>


          {/* PRÁCTICA */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-600
                mb-1
              "
            >
              Práctica <span className="text-red-500">*</span>
            </label>

            <select
              value={form.practica_id}
              onChange={(e) =>
                handleChange(
                  "practica_id",
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-slate-300
                rounded-md
                px-3
                py-2
                text-sm
                text-slate-700
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
              "
            >

              <option value="">
                Seleccione una práctica
              </option>

              {practicas.map((practica) => (

                <option
                  key={practica.id}
                  value={practica.id}
                >
                  {practica.Periodo.nombre}
                </option>

              ))}

            </select>

            {errores.practica_id && (
              <p className="text-xs text-red-500 mt-1">
                {errores.practica_id}
              </p>
            )}

          </div>


          {/* TUTOR */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-600
                mb-1
              "
            >
              Tutor empresarial{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              value={form.tutorEmpresa_id}
              onChange={(e) =>
                handleChange(
                  "tutorEmpresa_id",
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-slate-300
                rounded-md
                px-3
                py-2
                text-sm
                text-slate-700
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
              "
            >

              <option value="">
                Seleccione un tutor
              </option>

              {tutores.map((tutor) => (

                <option
                  key={tutor.id}
                  value={tutor.id}
                >
                  {tutor.nombre}
                </option>

              ))}

            </select>

            {errores.tutorEmpresa_id && (
              <p className="text-xs text-red-500 mt-1">
                {errores.tutorEmpresa_id}
              </p>
            )}

          </div>


          {/* CUPOS */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-600
                mb-1
              "
            >
              Cupos
            </label>

            <input
              type="number"
              min={1}
              value={form.cupos}
              onChange={(e) =>
                handleChange(
                  "cupos",
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-slate-300
                rounded-md
                px-3
                py-2
                text-sm
                text-slate-700
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
              "
            />

            {errores.cupos && (
              <p className="text-xs text-red-500 mt-1">
                {errores.cupos}
              </p>
            )}

          </div>


          {/* ESTADO */}

          <div>

            <label
              className="
                block
                text-sm
                font-medium
                text-slate-600
                mb-1
              "
            >
              Estado
            </label>

            <select
              value={form.estado}
              onChange={(e) =>
                handleChange(
                  "estado",
                  e.target.value
                )
              }
              className="
                w-full
                border
                border-slate-300
                rounded-md
                px-3
                py-2
                text-sm
                text-slate-700
                bg-white
                focus:outline-none
                focus:ring-2
                focus:ring-red-200
              "
            >

              {ESTADO_OPCIONES.map((opcion) => (

                <option
                  key={opcion}
                  value={opcion}
                >
                  {opcion === "DISPONIBLE"
                    ? "Disponible"
                    : "Cerrada"}
                </option>

              ))}

            </select>

          </div>

        </div>


        {/* BOTONES */}

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="
              px-4
              py-2
              rounded-xl
              bg-slate-200
              hover:bg-slate-300
              text-gray-700
            "
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="
              px-4
              py-2
              rounded-xl
              bg-[#e8192c]
              text-white
              hover:bg-[#c8111f]
            "
          >
            {mode === "crear"
              ? "Crear"
              : "Guardar cambios"}
          </button>

        </div>

      </div>

    </div>

  );
}