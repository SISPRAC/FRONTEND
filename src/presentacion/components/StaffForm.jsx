import bg from "../../assets/images/backgrounds/fondo.jpg"

export default function EmpresaForm({ onSubmit, onChange, errors, backendError, form }) {
  return (
     <div
      className="relative h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
        
        <div className="flex gap-6 bg-white/80 p-19 rounded-lg shadow-lg w-[900px]">
<div className="w-full p-20">
  <h1 className="text-center text-3xl font-extrabold text-gray-900 mb-4">Registro Tutor </h1>

  <form className="grid grid-cols-2 gap-x-8 gap-y-4" onSubmit={onSubmit}>
{/* Columna izquierda */}
    <div className="flex flex-col gap-4">
      {[
        { name:"cedula", label: "Cedula", placeholder: "Ingrese su cedula" },
        { name:"username", label: "Nombre", placeholder: "Ingrese su nombre" },
        { name:"email", label: "Correo", placeholder: "Ingrese su correo electronico", type: "email" },
      ].map(({ name, label, placeholder, type = "text" }) => (
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

    {/* Columna derecha */}
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-bold text-gray-700">Telefono</label>
        <input
          type="text"
          name="telefono"
          placeholder="Digite su telefono"
          onChange={onChange}
          value={form.telefono || ""}
          className={`bg-white rounded-xl px-4 py-2.5 text-sm text-gray-500 placeholder-gray-400 outline-none 
                      ${errors?.["telefono"] ? "border border-red-500 bg-red-100" : "bg-gray-200 focus:ring-2 focus:ring-red-300 focus:bg-gray-50"}`}
                  />
                  {errors?.["telefono"] && (
                    <span className="text-xs text-red-600">{errors["telefono"]}</span>
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
        {/* Botón Registrar */}
        <button type="submit" className="bg-red-600 hover:bg-red-700 active:scale-95 text-white font-extrabold rounded-full py-3 w-full transition-all">
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