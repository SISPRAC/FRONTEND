
import { useState } from "react";
import bg from "../../assets/images/backgrounds/fondo.jpg";
import programa from "../../assets/images/logo/Programa_Ingeniería_de_Sistemas.png";
import fondo from "../../assets/images/logo/LogoReportes.png";

import {
    LoaderCircle,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ShieldCheck
} from "lucide-react";

import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginForm({
    onSubmit,
    onChange,
    onGoogleSuccess,
    onGoogleError,
    loading = false
}) {
    const [verPassword, setVerPassword] = useState(false);

    return (
        <div
            className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Fondo */}
            <div className="absolute inset-0 bg-slate-900/25" />

            {/* Contenido */}
            <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">

                {/* Panel principal */}
                <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">

                    <div className="flex flex-col md:flex-row">

                        {/* Formulario */}
                        <div className="w-full md:w-[52%] flex items-center justify-center p-6 sm:p-9 lg:p-10">

                            <form
                                className="w-full max-w-sm flex flex-col items-center"
                                onSubmit={onSubmit}
                            >
                                {/* Logo SISPRAC */}
                                <div className="w-32 h-20 flex items-center justify-center mb-3">
                                    <img
                                        src={fondo}
                                        alt="Logo SISPRAC"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>

                                <h1 className="text-2xl font-bold text-gray-900 text-center">
                                    Bienvenido
                                </h1>

                                <p className="text-sm text-gray-500 text-center mt-2 mb-7">
                                    Inicia sesión para continuar en SISPRAC.
                                </p>

                                {/* Correo */}
                                <div className="w-full mb-5">
                                    <label
                                        htmlFor="correo"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Correo electrónico
                                    </label>

                                    <div className="flex items-center w-full h-11 bg-white border border-gray-300 rounded-xl px-4 gap-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">

                                        <Mail
                                            size={17}
                                            className="text-gray-400 shrink-0"
                                        />

                                        <input
                                            id="correo"
                                            type="email"
                                            name="correo"
                                            placeholder="ejemplo@correo.com"
                                            className="w-full h-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                            required
                                            autoComplete="email"
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Contraseña */}
                                <div className="w-full">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Contraseña
                                    </label>

                                    <div className="flex items-center w-full h-11 bg-white border border-gray-300 rounded-xl px-4 gap-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">

                                        <Lock
                                            size={17}
                                            className="text-gray-400 shrink-0"
                                        />

                                        <input
                                            id="password"
                                            type={verPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Ingresa tu contraseña"
                                            className="w-full h-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                                            required
                                            autoComplete="current-password"
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

                                {/* Recuperar contraseña */}
                                <div className="w-full flex justify-end mt-4">
                                    <Link
                                        to="/recuperar-password"
                                        className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>

                                {/* Botón iniciar sesión */}
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
                                            Validando...
                                        </>
                                    ) : (
                                        "Iniciar sesión"
                                    )}
                                </button>

                                {/* Separador */}
                                <div className="flex items-center gap-3 w-full my-5">
                                    <div className="flex-1 h-px bg-gray-200" />

                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                        O continúa con
                                    </span>

                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                {/* Google */}
                                <div
                                    className={`w-full flex justify-center overflow-hidden ${
                                        loading ? "pointer-events-none opacity-50" : ""
                                    }`}
                                >
                                    <GoogleLogin
                                        onSuccess={(cred) =>
                                            onGoogleSuccess(cred.credential)
                                        }
                                        onError={onGoogleError}
                                        shape="pill"
                                        text="signin_with"
                                        width="320"
                                    />
                                </div>

                                {/* Seguridad */}
                                <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
                                    <ShieldCheck size={14} />
                                    <span className="text-xs">
                                        Acceso seguro a la plataforma
                                    </span>
                                </div>
                            </form>
                        </div>

                        {/* Imagen institucional */}
                        <div className="hidden md:flex md:w-[48%] items-center justify-center bg-gray-50 border-l border-gray-100 p-8 lg:p-10">

                            <img
                                src={programa}
                                alt="Programa de Ingeniería de Sistemas"
                                className="w-full max-w-[340px] max-h-[340px] object-contain"
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
