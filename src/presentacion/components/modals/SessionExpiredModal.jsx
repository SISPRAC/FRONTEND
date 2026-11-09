import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SessionExpiredModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  if (!open) return null;

  const irAlLogin = () => {
    setOpen(false);
    navigate("/"); // ajusta a la ruta real de tu login
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Tu sesión expiró
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Por seguridad, debes iniciar sesión nuevamente para continuar.
        </p>
        <button
          onClick={irAlLogin}
          className="w-full h-11 rounded-full bg-red-600 text-white hover:opacity-90 transition"
        >
          Iniciar sesión
        </button>
      </div>
    </div>
  );
}