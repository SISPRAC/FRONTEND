
import { useState } from "react";
import { Link } from "react-router-dom";

import bg from "../../assets/images/backgrounds/fondo.jpg";
import programa from "../../assets/images/logo/Programa_Ingeniería_de_Sistemas.png";
import fondo from "../../assets/images/logo/LogoReportes.png";

import {
    LoaderCircle,
    Lock,
    Eye,
    EyeOff,
    CircleCheck,
    TriangleAlert,
    ShieldCheck
} from "lucide-react";

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
        <div
            className="relative min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center p-5">

                {/* Contenedor principal */}
                <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12 bg-white/90 px-8 py-10 md:px-12 md:py-12 rounded-2xl shadow-xl">

                    {/* Formulario */}
                    <div className="w-full md:flex-1 flex items-center justify-center md:px-5">

                        {!tokenValido ? (

                            /* Enlace inválido */
                            <div className="w-full max-w-sm flex flex-col items-center text-center">

                                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                                    <TriangleAlert size={29} className="text-red-600" />
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Enlace inválido
                                </h2>

                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Este enlace no es válido o ha expirado.
                                    Solicita uno nuevo para continuar con el proceso.
                                </p>

                                <Link
                                    to="/recuperar-password"
                                    className="w-full h-11 rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center"
                                >
                                    Solicitar nuevo enlace
                                </Link>
                            </div>

                        ) : exito ? (

                            /* Contraseña actualizada */
                            <div className="w-full max-w-sm flex flex-col items-center text-center">

                                <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-5">
                                    <CircleCheck size={30} className="text-green-600" />
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    ¡Contraseña actualizada!
                                </h2>

                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Tu contraseña se actualizó correctamente.
                                    Ya puedes iniciar sesión con tus nuevas credenciales.
                                </p>

                                <Link
                                    to="/"
                                    className="w-full h-11 rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center"
                                >
                                    Ir a iniciar sesión
                                </Link>
                            </div>

                        ) : (

                            /* Formulario */
                            <form
                                className="w-full max-w-sm flex flex-col items-center"
                                onSubmit={onSubmit}
                            >
                                {/* Logo SISPRAC */}
                                <div className="w-30 h-24 flex items-center justify-center mb-2">
                                    <img
                                        src={fondo}
                                        alt="Logo SISPRAC"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-900 text-center mb-2">
                                    Nueva contraseña
                                </h2>

                                <p className="text-sm text-gray-500 text-center leading-relaxed mb-7">
                                    Crea una contraseña segura para proteger
                                    tu cuenta.
                                </p>

                                {/* Nueva contraseña */}
                                <div className="w-full mb-5">
                                    <label
                                        htmlFor="nuevaPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2 ml-1"
                                    >
                                        Nueva contraseña
                                    </label>

                                    <div className="flex items-center w-full bg-white border border-gray-300 h-12 rounded-full overflow-hidden px-5 gap-3 focus-within:border-red-500 transition-colors">

                                        <Lock
                                            size={16}
                                            className="text-gray-500 shrink-0"
                                        />

                                        <input
                                            id="nuevaPassword"
                                            type={verPassword ? "text" : "password"}
                                            name="nuevaPassword"
                                            placeholder="Ingresa tu nueva contraseña"
                                            className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
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
                                        className="block text-sm font-medium text-gray-700 mb-2 ml-1"
                                    >
                                        Confirmar contraseña
                                    </label>

                                    <div className="flex items-center w-full bg-white border border-gray-300 h-12 rounded-full overflow-hidden px-5 gap-3 focus-within:border-red-500 transition-colors">

                                        <Lock
                                            size={16}
                                            className="text-gray-500 shrink-0"
                                        />

                                        <input
                                            id="confirmarPassword"
                                            type={verPassword ? "text" : "password"}
                                            name="confirmarPassword"
                                            placeholder="Confirma tu contraseña"
                                            className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
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
                                    className={`mt-6 w-full h-11 rounded-full text-sm font-medium text-white transition-all flex items-center justify-center gap-2
                                        ${
                                            loading
                                                ? "bg-red-400 cursor-not-allowed"
                                                : "bg-red-600 hover:bg-red-700"
                                        }`}
                                >
                                    {loading ? (
                                        <>
                                            <LoaderCircle
                                                size={19}
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

                    {/* Logo Ingeniería de Sistemas */}
                    <div className="hidden md:flex w-full md:w-[400px] h-[350px] items-center justify-center border-l border-gray-200 md:pl-10">

                        <img
                            className="max-w-full max-h-full object-contain"
                            src={programa}
                            alt="Programa de Ingeniería de Sistemas"
                        />

                    </div>
                </div>
            </div>
        </div>
    );
}
