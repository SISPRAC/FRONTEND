import bg from "../../assets/images/backgrounds/fondo.jpg";

import ImgUpload from "../components/Upload/ImgUpload";

export default function EmpresaForm({
  onSubmit,
  onChange,
  handleFileSelect,
  errors,
  backendError,
  form
}) {

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 flex items-center justify-center">

        <div className="flex gap-6 bg-white/80 rounded-lg shadow-lg w-[900px]">

          <div className="w-full">

            <h1 className="text-center text-3xl font-extrabold text-gray-900 mt-4">
              Registro Empresa
            </h1>

            <form
              className="grid grid-cols-2 gap-x-8 gap-y-4 m-8 p-5"
              onSubmit={onSubmit}
            >

              {/* =====================================================
                  COLUMNA IZQUIERDA
              ===================================================== */}

              <div className="flex flex-col gap-4">

                {[
                  {
                    name: "nit",
                    label: "NIT",
                    placeholder: "Ingrese el NIT de la empresa",
                    type: "text",

                  },
                  {
                    name: "nombre",
                    label: "Empresa",
                    placeholder: "Ingrese el nombre de la empresa",
                    type: "text"
                  },
                  {
                    name: "direccion",
                    label: "Dirección",
                    placeholder: "Ingrese la dirección de la empresa",
                    type: "text"
                  },
                  {
                    name: "telefono",
                    label: "Teléfono",
                    placeholder: "Ingrese el número de teléfono de contacto",
                    type: "text",
                    maxLength: 10
                  },
                  {
                    name: "correo",
                    label: "Correo",
                    placeholder: "Ingrese el correo electrónico",
                    type: "email",
                    readOnly: true
                  },
                  {
                    name: "password",
                    label: "Contraseña",
                    placeholder: "Cree una contraseña segura (mínimo 8 caracteres)",
                    type: "password"
                  },
                ].map(
                  ({
                    name,
                    label,
                    placeholder,
                    type,
                    readOnly,
                    maxLength
                  }) => (
                    <div
                      key={label}
                      className="flex flex-col gap-1"
                    >

                      <label className="text-sm font-bold text-gray-700">
                        {label}
                      </label>

                      <input
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        onChange={onChange}
                        value={form[name] || ""}
                        readOnly={readOnly}
                        maxLength={maxLength}
                        className={`rounded-xl px-4 py-2.5 text-sm text-gray-700
          placeholder-gray-400 outline-none border border-gray-200

          ${readOnly
                            ? "cursor-not-allowed"
                            : "focus:ring-2 focus:ring-red-300 focus:border-red-300"
                          }

          ${errors?.[name]
                            ? "border border-red-500 bg-red-100"
                            : ""
                          }
        `}
                      />

                      {name === "correo" && (
                        <span className="text-xs text-gray-500">
                          Correo asignado mediante invitación
                        </span>
                      )}

                      {errors?.[name] && (
                        <span className="text-xs text-red-600">
                          {errors[name]}
                        </span>
                      )}

                    </div>
                  )
                )}

              </div>


              {/* =====================================================
                  COLUMNA DERECHA
              ===================================================== */}

              <div className="flex flex-col gap-4">

                {/* NOMBRES */}

                <div className="flex flex-col gap-1">

                  <label className="text-sm font-bold text-gray-700">
                    Nombres
                  </label>

                  <input
                    type="text"
                    name="nombres"
                    placeholder="Ingrese los nombres del director de la empresa"
                    onChange={onChange}
                    value={form.nombres || ""}
                    className={`bg-white rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                    ${errors?.nombres
                        ? "border border-red-500 bg-red-100"
                        : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                      }`}
                  />

                  {errors?.nombres && (
                    <span className="text-xs text-red-600">
                      {errors.nombres}
                    </span>
                  )}

                </div>


                {/* APELLIDOS */}

                <div className="flex flex-col gap-1">

                  <label className="text-sm font-bold text-gray-700">
                    Apellidos
                  </label>

                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Ingrese los apellidos del director de la empresa"
                    onChange={onChange}
                    value={form.apellidos || ""}
                    className={`bg-white rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                    ${errors?.apellidos
                        ? "border border-red-500 bg-red-100"
                        : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                      }`}
                  />

                  {errors?.apellidos && (
                    <span className="text-xs text-red-600">
                      {errors.apellidos}
                    </span>
                  )}

                </div>


                {/* DOCUMENTO */}

                <div className="flex gap-2 items-start">

                  <div className="flex flex-col gap-1">

                    <label className="text-sm font-bold text-gray-700 w-14 text-center">
                      Tipo
                    </label>

                    <select
                      name="tipo_documento"
                      value={form.tipo_documento}
                      onChange={onChange}
                      className={`bg-white rounded-xl px-2 py-2.5 text-sm outline-none w-14
                      ${errors?.tipo_documento
                          ? "border border-red-500 bg-red-100"
                          : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    >

                      <option value="" disabled>
                        --
                      </option>

                      <option value="CC">
                        CC
                      </option>

                      <option value="CE">
                        CE
                      </option>

                      <option value="PA">
                        PA
                      </option>

                      <option value="PEP">
                        PEP
                      </option>

                    </select>

                  </div>


                  <div className="flex-1 flex flex-col gap-1">

                    <label className="text-sm font-bold text-gray-700 px-4">
                      Documento
                    </label>

                    <input
                      name="cedula"
                      type="text"
                      maxLength={14}
                      placeholder="Ingrese su documento"
                      onChange={onChange}
                      value={form.cedula || ""}
                      className={`bg-white w-full rounded-xl px-4 py-2.5 text-sm outline-none
                      ${errors?.cedula
                          ? "border border-red-500 bg-red-100"
                          : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    />

                    {(errors?.cedula || errors?.tipo_documento) && (
                      <span className="text-xs text-red-600">
                        {errors.cedula || errors.tipo_documento}
                      </span>
                    )}

                  </div>

                </div>


                {/* LOGO */}

                <div className="flex flex-col gap-3 pt-2">

                  <ImgUpload
                    onFileSelect={handleFileSelect}
                  />

                  {errors?.logo && (
                    <span className="text-xs text-red-600">
                      {errors.logo}
                    </span>
                  )}

                </div>


                {/* REGISTRAR */}

                <div className="justify-center mt-3">

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-full py-3 px-10 transition-all w-full"
                  >
                    Registrar
                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}