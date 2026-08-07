import bg from "../../assets/images/backgrounds/fondo.jpg";
import { Trash } from "lucide-react";

import FileUpload from "../components/Upload/FileUpload";

export default function CandidateForm({
  onSubmit,
  onChange,
  handleFileSelect,
  errors,
  backendError,
  form,
  perfiles,
  addPerfil,
  removePerfil,
  handlePerfilChange,
  listaPerfiles
}) {
  return (
    <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 flex items-center justify-center">

        <div className="flex gap-6 bg-white/70 rounded-lg shadow-lg w-[900px]">
          <div className="w-full ">
            <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-4 mt-4">Registro Candidato</h1>
            <form className="grid grid-cols-3 gap-x-8 gap-y-4 m-8 p-5" onSubmit={onSubmit}>
              {/* Columna izquierda */}
              <div className="flex flex-col gap-4">
                {[
                  { name: "codigo", label: "Codigo", placeholder: "Ingrese su codigo estudiantil", type: "text" },
                  { name: "nombres", label: "Nombres", placeholder: "Ingrese sus nombres", type: "text" },
                  { name: "apellidos", label: "Apellidos", placeholder: "Ingrese sus apellidos", type: "text" },
                  { name: "telefono", label: "Telefono", placeholder: "Ingrese su telefono", type: "text" },
                ].map(({ name, label, placeholder, type }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700">{label}</label>
                    <input
                      name={name}
                      type={type}
                      placeholder={placeholder}
                      onChange={onChange}
                      value={form[name] || ""}
                      className={`bg-white rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none 
                      ${errors?.[name] ? "border border-red-500 bg-red-100" : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"}`}
                    />
                    {errors?.[name] && (
                      <span className="text-xs text-red-600">{errors[name]}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Columna centro */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 items-start ">

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700 w-14 text-center">
                      Tipo
                    </label>

                    <select
                      name="tipo_documento"
                      value={form.tipo_documento}
                      onChange={onChange}
                      className={`bg-white rounded-xl px-2 py-2.5 text-sm outline-none w-14
              ${errors?.["tipo_documento"]
                          ? "border border-red-500 bg-red-100"
                          : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    >
                      <option value="" disabled>--</option>
                      <option value="CC">CC</option>
                      <option value="CE">CE</option>
                      <option value="PA">PA</option>
                      <option value="PEP">PEP</option>
                    </select>

                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700 px-4">
                      Documento
                    </label>

                    <input
                      name="cedula"
                      type="text"
                      placeholder="Ingrese su documento"
                      onChange={onChange}
                      value={form.cedula || ""}
                      className={`bg-white w-full rounded-xl px-4 py-2.5 text-sm outline-none
                          ${errors?.["cedula"]
                          ? "border border-red-500 bg-red-100"
                          : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    />

                    {errors?.["cedula"] || errors?.["tipo_documento"] ? (
                      <span className="text-xs text-red-600">
                        {errors["cedula"] || errors["tipo_documento"]}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">Correo</label>
                  <input
                    name="correo"
                    type="email"
                    placeholder="Ingrese su correo electronico"
                    onChange={onChange}
                    className={`bg-white rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none 
                      ${errors?.["correo"] ? "border border-red-500 bg-red-100" : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"}`}
                  />
                  {errors?.["correo"] && (
                    <span className="text-xs text-red-600">{errors["correo"]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Cree una contraseña segura (mínimo 8 caracteres)"
                    onChange={onChange}
                    className={`bg-white rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none 
                      ${errors?.["password"] ? "border border-red-500 bg-red-100" : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"}`}
                  />
                  {errors?.["password"] && (
                    <span className="text-xs text-red-600">{errors["password"]}</span>
                  )}
                </div>

                <div className="flex flex-col gap-3  pt-2">
                  {/* Cargar CV */}
                  <FileUpload onFileSelect={handleFileSelect} />
                  {errors?.cv && (
                    <span className="text-xs text-red-600">{errors.cv}</span>
                  )}


                </div>

              </div>
              {/* Columna derecha */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">

                  <label className="text-sm font-bold text-gray-700">
                    Seleciona tu perfil y calificación
                  </label>

                  {perfiles.map((perfil, index) => (
                    <div key={index} className="flex gap-2">

                      <select
                        value={perfil.perfil_id}
                        onChange={(e) =>
                          handlePerfilChange(
                            index,
                            "perfil_id",
                            e.target.value
                          )
                        }
                        className="flex-1 rounded-xl px-3 py-2 bg-white"
                      >
                        <option value="" disabled> Perfil</option>

                        {listaPerfiles.map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.nombre}
                          </option>
                        ))}
                      </select>

                      <select
                        value={perfil.calificacion}
                        onChange={(e) =>
                          handlePerfilChange(
                            index,
                            "calificacion",
                            e.target.value
                          )
                        }
                        className="w-24 rounded-xl px-3 py-2 bg-white"
                      >
                        <option value="" disabled> Nota</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>

                      {perfiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePerfil(index)}
                          className="px-3 rounded-xl bg-red-500 text-white w-12"
                        >
                          <Trash />
                        </button>
                      )}

                    </div>
                  ))}

                  {perfiles.length < 2 &&
                    perfiles.every((p) => p.perfil_id && p.calificacion) && (
                      <button
                        type="button"
                        onClick={addPerfil}
                        className="self-start px-4 py-2 rounded-xl bg-red-600 text-white"
                      >
                        + Agregar Perfil
                      </button>
                    )}

                  {/* Botón Registrar */}
                  <button type="submit" className="mt-5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-full py-3 w-full transition-all">
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