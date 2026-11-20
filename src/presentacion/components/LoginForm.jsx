
import bg from "../../assets/images/backgrounds/fondo.jpg";
import programa from "../../assets/images/logo/Programa_Ingeniería_de_Sistemas.png";
import fondo from "../../assets/images/logo/logoReportes.png";
import { LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginForm({
    onSubmit,
    onChange,
    onGoogleSuccess,
    onGoogleError,
    loading = false
}) {

    return (
        <div
            className="relative min-h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center p-4">

                {/* Contenedor principal */}
                <div className="flex flex-col md:flex-row items-center gap-8 bg-white/90 p-8 md:p-12 rounded-2xl shadow-xl">

                    {/* Formulario */}
                    <div className="w-full md:w-[420px] flex items-center justify-center">

                        <form
                            className="w-full flex flex-col items-center justify-center"
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

                            <p className="text-sm text-gray-500 text-center mb-6">
                                ¡Bienvenido! Por favor, inicia sesión para continuar.
                            </p>

                            {/* Correo */}
                            <div className="flex items-center w-full bg-white border border-gray-300 h-12 rounded-full overflow-hidden px-5 gap-3">
                                <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280" />
                                </svg>

                                <input
                                    type="email"
                                    name="correo"
                                    placeholder="Correo electrónico"
                                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                                    required
                                    onChange={onChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="flex items-center mt-5 w-full bg-white border border-gray-300 h-12 rounded-full overflow-hidden px-5 gap-3">
                                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280" />
                                </svg>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                                    required
                                    onChange={onChange}
                                    disabled={loading}
                                />
                            </div>

                            {/* Recordarme y recuperar contraseña */}
                            <div className="w-full flex items-center justify-end mt-6 text-gray-500">
                                <Link
                                    className="text-sm underline hover:text-red-600 transition-colors"
                                    to="/recuperar-password"
                                >
                                    ¿Olvidaste la contraseña?
                                </Link>
                            </div>

                            {/* Botón iniciar sesión */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`mt-7 w-full h-11 rounded-full text-white transition-all flex items-center justify-center gap-2
                                    ${loading
                                        ? "bg-red-400 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle size={20} className="animate-spin" />
                                        Validando...
                                    </>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </button>

                            {/* Separador Google */}
                            <div className="flex items-center gap-4 w-full my-5">
                                <div className="flex-1 h-px bg-gray-300" />
                                <p className="text-nowrap text-sm text-gray-500">
                                    o continúa con Google
                                </p>
                                <div className="flex-1 h-px bg-gray-300" />
                            </div>

                            {/* Google Login */}
                            <div className={`w-full flex justify-center ${loading ? "pointer-events-none opacity-50" : ""}`}>
                                <GoogleLogin
                                    onSuccess={(cred) => onGoogleSuccess(cred.credential)}
                                    onError={onGoogleError}
                                    shape="pill"
                                    text="signin_with"
                                    width="320"
                                />
                            </div>

                        </form>
                    </div>

                    {/* Logo Ingeniería de Sistemas */}
                    <div className="hidden md:flex w-[400px] h-[400px] items-center justify-center border-l border-gray-200 pl-8">

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
