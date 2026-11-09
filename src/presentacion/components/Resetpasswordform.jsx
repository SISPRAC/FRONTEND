import { useState } from "react";
import { Link } from "react-router-dom";
import {
    LoaderCircle,
    Lock,
    Eye,
    EyeOff,
    CircleCheck,
    TriangleAlert
} from "lucide-react";
import AuthLayout from "../pages/Authlayout";

export default function ResetPasswordForm({
    onSubmit,
    onChange,
    loading = false,
    exito = false,
    tokenValido = true,
    error = ""
}) {

    const [verPassword, setVerPassword] = useState(false);

    return (
        <AuthLayout>

            {/* Enlace sin token */}
            {!tokenValido ? (

                <div className="flex flex-col items-center justify-center text-center mt-6 ml-12 mb-12">

                    <TriangleAlert size={56} className="text-red-600 mb-4" />

                    <h2 className="text-3xl text-gray-900 font-medium mb-3">
                        Enlace inválido
                    </h2>

                    <p className="text-sm text-gray-500/90 mb-6">
                        Este enlace no es válido o ha expirado. Solicita uno nuevo.
                    </p>

                    <Link
                        to="/recuperar-password"
                        className="w-full h-11 rounded-full text-white bg-red-600 hover:opacity-90 transition-all flex items-center justify-center"
                    >
                        Solicitar nuevo enlace
                    </Link>

                </div>

            ) : exito ? (

                <div className="flex flex-col items-center justify-center text-center mt-6 ml-12 mb-12">

                    <CircleCheck size={56} className="text-green-600 mb-4" />

                    <h2 className="text-3xl text-gray-900 font-medium mb-3">
                        ¡Contraseña actualizada!
                    </h2>

                    <p className="text-sm text-gray-500/90 mb-6">
                        Ya puedes iniciar sesión con tu nueva contraseña.
                        Te redirigiremos en unos segundos.
                    </p>

                    <Link
                        to="/"
                        className="w-full h-11 rounded-full text-white bg-red-600 hover:opacity-90 transition-all flex items-center justify-center"
                    >
                        Ir a iniciar sesión
                    </Link>

                </div>

            ) : (

                <form
                    className="flex flex-col items-center justify-center mt-6 ml-12 mb-12"
                    onSubmit={onSubmit}
                >
                    <h2 className="text-4xl text-gray-900 font-medium mb-3">
                        Nueva contraseña
                    </h2>

                    <p className="text-sm text-gray-500/90 mt-3 mb-6 text-center">
                        Mínimo 8 caracteres, con letras y números
                    </p>

                    {/* Nueva contraseña */}
                    <div className="flex items-center w-full bg-white bg-transparent border border-black-900 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2">

                        <Lock size={16} className="text-gray-500 shrink-0" />

                        <input
                            type={verPassword ? "text" : "password"}
                            name="nuevaPassword"
                            placeholder="Nueva contraseña"
                            className="ml-2 bg-white bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            onChange={onChange}
                            disabled={loading}
                        />

                        <button
                            type="button"
                            onClick={() => setVerPassword(!verPassword)}
                            className="text-gray-500 hover:text-gray-700 shrink-0"
                            tabIndex={-1}
                        >
                            {verPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Confirmar contraseña */}
                    <div className="flex items-center mt-6 w-full bg-white bg-transparent border border-black-900 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2">

                        <Lock size={16} className="text-gray-500 shrink-0" />

                        <input
                            type={verPassword ? "text" : "password"}
                            name="confirmarPassword"
                            placeholder="Confirmar contraseña"
                            className="ml-2 bg-white bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                            required
                            minLength={8}
                            autoComplete="new-password"
                            onChange={onChange}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <p className="w-full mt-4 text-sm text-red-600 text-center">
                            {error}
                        </p>
                    )}

                    {/* Botón guardar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`mt-8 w-full h-11 rounded-full text-white transition-all flex items-center justify-center gap-2
              ${loading
                                ? "bg-red-400 cursor-not-allowed"
                                : "bg-red-600 hover:opacity-90"
                            }`}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle size={20} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Cambiar contraseña"
                        )}
                    </button>

                </form>

            )}

        </AuthLayout>
    );
}