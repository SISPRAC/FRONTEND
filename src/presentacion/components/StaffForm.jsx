import bg from "../../assets/images/backgrounds/fondo.jpg";

export default function StaffForm({
  onSubmit,
  onChange,
  errors,
  backendError,
  form,
  rol
}) {
  const esTutorDocente = rol === "Tutor Docente";
  const esTutorEmpresarial = rol === "Tutor Empresarial";

  return (
    <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 flex items-center justify-center">

        <div className="flex gap-6 bg-white/80 p-19 rounded-lg shadow-lg w-[900px]">

          <div className="w-full p-20">

            <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-4">
              Registro {rol || "Tutor"}
            </h1>

            <form
              className="grid grid-cols-2 gap-x-8 gap-y-4"
              onSubmit={onSubmit}
            >

              {/* =========================
                    COLUMNA IZQUIERDA
                  ========================= */}
              <div className="flex flex-col gap-4">

                {/* Tipo de documento + Cédula */}
                <div className="flex gap-2 items-start">

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700 w-14 text-center">
                      Tipo
                    </label>

                    <select
                      name="tipo_documento"
                      value={form.tipo_documento || ""}
                      onChange={onChange}
                      className={`rounded-xl px-2 py-2.5 text-sm outline-none w-14
                        ${
                          errors?.tipo_documento
                            ? "border border-red-500 bg-red-100"
                            : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
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
                      Cédula
                    </label>

                    <input
                      type="text"
                      name="cedula"
                       maxLength={14}
                      placeholder="Ingrese su cédula"
                      onChange={onChange}
                      value={form.cedula || ""}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                        ${
                          errors?.cedula
                            ? "border border-red-500 bg-red-100"
                            : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    />

                    {(errors?.cedula || errors?.tipo_documento) && (
                      <span className="text-xs text-red-600">
                        {errors.cedula || errors.tipo_documento}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nombres */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Nombres
                  </label>

                  <input
                    type="text"
                    name="nombres"
                    placeholder="Ingrese sus nombres"
                    onChange={onChange}
                    value={form.nombres || ""}
                    className={`rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                      ${
                        errors?.nombres
                          ? "border border-red-500 bg-red-100"
                          : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                      }`}
                  />

                  {errors?.nombres && (
                    <span className="text-xs text-red-600">
                      {errors.nombres}
                    </span>
                  )}
                </div>

                {/* Apellidos */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Apellidos
                  </label>

                  <input
                    type="text"
                    name="apellidos"
                    placeholder="Ingrese sus apellidos"
                    onChange={onChange}
                    value={form.apellidos || ""}
                    className={`rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                      ${
                        errors?.apellidos
                          ? "border border-red-500 bg-red-100"
                          : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                      }`}
                  />

                  {errors?.apellidos && (
                    <span className="text-xs text-red-600">
                      {errors.apellidos}
                    </span>
                  )}
                </div>

                {/* Correo */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Correo
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="Correo de la invitación"
                    value={form.email || ""}
                    disabled
                    className="bg-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-600 outline-none cursor-not-allowed"
                  />

                  {errors?.email && (
                    <span className="text-xs text-red-600">
                      {errors.email}
                    </span>
                  )}
                </div>

              </div>


              {/* =========================
                    COLUMNA DERECHA
                  ========================= */}
              <div className="flex flex-col gap-4">

                {/* Teléfono */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Teléfono
                  </label>

                  <input
                    type="text"
                    name="telefono"
                    placeholder="Digite su teléfono"
                    onChange={onChange}
                    value={form.telefono || ""}
                    className={`rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                      ${
                        errors?.telefono
                          ? "border border-red-500 bg-red-100"
                          : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                      }`}
                  />

                  {errors?.telefono && (
                    <span className="text-xs text-red-600">
                      {errors.telefono}
                    </span>
                  )}
                </div>


                {/* =========================
                      TUTOR DOCENTE
                    ========================= */}
                {esTutorDocente && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700">
                      Código
                    </label>

                    <input
                      type="text"
                      name="codigo"
                      maxLength={10}
                      placeholder="Ingrese su código"
                      onChange={onChange}
                      value={form.codigo || ""}
                      className={`rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                        ${
                          errors?.codigo
                            ? "border border-red-500 bg-red-100"
                            : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    />

                    {errors?.codigo && (
                      <span className="text-xs text-red-600">
                        {errors.codigo}
                      </span>
                    )}
                  </div>
                )}


                {/* =========================
                      TUTOR EMPRESARIAL
                    ========================= */}
                {esTutorEmpresarial && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-bold text-gray-700">
                      Cargo
                    </label>

                    <input
                      type="text"
                      name="cargo"
                      placeholder="Ingrese su cargo"
                      onChange={onChange}
                      value={form.cargo || ""}
                      className={`rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                        ${
                          errors?.cargo
                            ? "border border-red-500 bg-red-100"
                            : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                        }`}
                    />

                    {errors?.cargo && (
                      <span className="text-xs text-red-600">
                        {errors.cargo}
                      </span>
                    )}
                  </div>
                )}


                {/* Contraseña */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-gray-700">
                    Contraseña
                  </label>

                  <input
                    type="password"
                    name="password"
                    placeholder="Cree una contraseña segura"
                    onChange={onChange}
                    value={form.password || ""}
                    className={`rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none
                      ${
                        errors?.password
                          ? "border border-red-500 bg-red-100"
                          : "bg-white focus:ring-2 focus:ring-red-300 focus:bg-gray-50"
                      }`}
                  />

                  {errors?.password && (
                    <span className="text-xs text-red-600">
                      {errors.password}
                    </span>
                  )}
                </div>


                {/* Error backend */}
                {backendError && (
                  <span className="text-sm text-red-600">
                    {backendError}
                  </span>
                )}


                {/* Botón */}
                <div className="flex flex-col gap-3 pt-2">

                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-full py-3 w-full transition-all"
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