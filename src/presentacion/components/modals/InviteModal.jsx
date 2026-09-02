import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function InviteModal({
  isOpen,
  onClose,
  onSubmit,
  tipo = "tutor"
}) {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCorreo("");
      setError("");
      setEnviando(false);
    }
  }, [isOpen]);

  const validarCorreo = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const correoLimpio = correo.trim();

    if (!correoLimpio) {
      setError("El correo electrónico es obligatorio.");
      return;
    }

    if (!validarCorreo(correoLimpio)) {
      setError("Ingrese un correo electrónico válido.");
      return;
    }

    setError("");
    setEnviando(true);

    try {

      await onSubmit(correoLimpio);

      setCorreo("");
      onClose();

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al enviar la invitación"
      );

    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  const esEmpresa = tipo === "empresa";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">

        <h2 className="text-xl font-bold text-slate-800 mb-1">
          {esEmpresa ? "Invitar empresa" : "Invitar tutor"}
        </h2>

        <p className="text-sm text-slate-500 mb-5">
          Se enviará una invitación al correo ingresado.
        </p>

        <form onSubmit={handleSubmit}>

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Correo electrónico
          </label>

          <input
            type="email"
            value={correo}
            onChange={(e) => {
              setCorreo(e.target.value);

              if (error) {
                setError("");
              }
            }}
            placeholder="correo@ejemplo.com"
            autoFocus
            className={`
              w-full px-4 py-2 mb-1
              border rounded-lg text-sm
              focus:outline-none focus:ring-2
              ${
                error
                  ? "border-red-400 focus:ring-red-300"
                  : "border-slate-300 focus:ring-blue-400"
              }
            `}
          />

          {error && (
            <p className="text-xs text-red-500 mb-3">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 mt-5">

            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="
                px-4 py-2
                text-slate-600 font-medium
                rounded-lg
                hover:bg-slate-100
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={enviando}
              className="
                px-5 py-2
                bg-[#e8192c] hover:bg-[#c8111f]
                text-white font-semibold
                rounded-lg
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {enviando
                ? "Enviando..."
                : "Enviar invitación"
              }
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}