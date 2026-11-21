
import { useState } from "react";
import { Link } from "react-router-dom";
import {
    LoaderCircle,
    Lock,
    Eye,
    EyeOff,
    CircleCheck,
    TriangleAlert,
    ShieldCheck
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
            <div className="w-full max-w-md mx-auto px-5 sm:px-6 py-6">

                {/* Enlace inválido */}
                {!tokenValido ? (
                    <div className="flex flex-col items-center text-center">

                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                            <TriangleAlert size={32} className="text-red-600" />
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Enlace inválido
                        </h2>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm">
                            Este enlace no es válido o ha expirado.
                            Solicita uno nuevo para continuar con el proceso.
                        </p>

                        <Link
                            to="/recuperar-password"
                            className="w-full max-w-xs h-11 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center"
                        >
                            Solicitar nuevo enlace
                        </Link>

                    </div>

                ) : exito ? (

                    /* Contraseña actualizada */
                    <div className="flex flex-col items-center text-center">

                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
                            <CircleCheck size={34} className="text-green-600" />
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            ¡Contraseña actualizada!
                        </h2>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm">
                            Tu contraseña se actualizó correctamente.
                            Ya puedes iniciar sesión con tus nuevas credenciales.
                        </p>

                        <Link
                            to="/"
                            className="w-full max-w-xs h-11 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center"
                        >
                            Ir a iniciar sesión
                        </Link>

                    </div>

                ) : (

                    /* Formulario */
                    <form
                        className="flex flex-col items-center w-full"
                        onSubmit={onSubmit}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <ShieldCheck size={25} className="text-red-600" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-2">
                            Nueva contraseña
                        </h2>

                        <p className="text-sm text-gray-500 text-center leading-relaxed mb-7 max-w-sm">
                            Crea una contraseña segura para proteger
                            tu cuenta.
                        </p>

                        {/* Nueva contraseña */}
                        <div className="w-full mb-5">
                            <label
                                htmlFor="nuevaPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Nueva contraseña
                            </label>

                            <div className="flex items-center w-full h-11 bg-white border border-gray-300 rounded-xl px-4 gap-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">

                                <Lock
                                    size={17}
                                    className="text-gray-400 shrink-0"
                                />

                                <input
                                    id="nuevaPassword"
                                    type={verPassword ? "text" : "password"}
                                    name="nuevaPassword"
                                    placeholder="Ingresa tu nueva contraseña"
                                    className="w-full h-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    onChange={onChange}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    onClick={() => setVerPassword(!verPassword)}
                                    className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    tabIndex={-1}
                                >
                                    {verPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="w-full">
                            <label
                                htmlFor="confirmarPassword"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Confirmar contraseña
                            </label>

                            <div className="flex items-center w-full h-11 bg-white border border-gray-300 rounded-xl px-4 gap-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">

                                <Lock
                                    size={17}
                                    className="text-gray-400 shrink-0"
                                />

                                <input
                                    id="confirmarPassword"
                                    type={verPassword ? "text" : "password"}
                                    name="confirmarPassword"
                                    placeholder="Confirma tu contraseña"
                                    className="w-full h-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    onChange={onChange}
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    onClick={() => setVerPassword(!verPassword)}
                                    className="text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                                    aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    tabIndex={-1}
                                >
                                    {verPassword
                                        ? <EyeOff size={18} />
                                        : <Eye size={18} />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Información */}
                        <div className="w-full mt-4 flex items-start gap-2 text-xs text-gray-500">
                            <ShieldCheck
                                size={15}
                                className="text-gray-400 shrink-0 mt-0.5"
                            />
                            <p>
                                Utiliza al menos 8 caracteres, incluyendo letras y números.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="w-full mt-4 text-sm text-red-600 text-center">
                                {error}
                            </p>
                        )}

                        {/* Botón */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`mt-6 w-full h-11 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2
                                ${
                                    loading
                                        ? "bg-red-400 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700 active:scale-[0.98]"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Guardando...
                                </>
                            ) : (
                                "Cambiar contraseña"
                            )}
                        </button>

                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
