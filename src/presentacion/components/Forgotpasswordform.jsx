
import bg from "../../assets/images/backgrounds/fondo.jpg";
import programa from "../../assets/images/logo/Programa_Ingeniería_de_Sistemas.png";
import fondo from "../../assets/images/logo/LogoReportes.png";

import { Link } from "react-router-dom";
import {
    LoaderCircle,
    Mail,
    MailCheck,
    ArrowLeft
} from "lucide-react";

export default function ForgotPasswordForm({
    onSubmit,
    onChange,
    loading = false,
    enviado = false,
    error = ""
}) {
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

                        {enviado ? (
                            <div className="w-full max-w-sm flex flex-col items-center text-center">

                                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
                                    <MailCheck size={28} className="text-red-600" />
                                </div>

                                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                    Revisa tu correo
                                </h2>

                                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                    Si el correo está registrado, te enviamos un enlace
                                    para restablecer tu contraseña. El enlace es válido
                                    por 15 minutos.
                                </p>

                                <Link
                                    to="/"
                                    className="w-full h-11 rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center"
                                >
                                    Volver a iniciar sesión
                                </Link>
                            </div>
                        ) : (
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
                                    Recuperar contraseña
                                </h2>

                                <p className="text-sm text-gray-500 text-center leading-relaxed mb-7">
                                    Ingresa tu correo electrónico y te enviaremos
                                    un enlace para crear una nueva contraseña.
                                </p>

                                {/* Correo */}
                                <div className="w-full">
                                    <label
                                        htmlFor="correo"
                                        className="block text-sm font-medium text-gray-700 mb-2 ml-1"
                                    >
                                        Correo electrónico
                                    </label>

                                    <div className="flex items-center w-full bg-white border border-gray-300 h-12 rounded-full overflow-hidden px-5 gap-3 focus-within:border-red-500 transition-colors">
                                        <Mail
                                            size={17}
                                            className="text-gray-500 shrink-0"
                                        />

                                        <input
                                            id="correo"
                                            type="email"
                                            name="correo"
                                            placeholder="Correo electrónico"
                                            className="bg-transparent text-gray-700 placeholder-gray-500 outline-none text-sm w-full h-full"
                                            required
                                            onChange={onChange}
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="w-full mt-3 text-sm text-red-600 text-center">
                                        {error}
                                    </p>
                                )}

                                {/* Botón enviar */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`mt-7 w-full h-11 rounded-full text-sm font-medium text-white transition-all flex items-center justify-center gap-2
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
                                            Enviando...
                                        </>
                                    ) : (
                                        "Enviar enlace"
                                    )}
                                </button>

                                {/* Volver al login */}
                                <Link
                                    to="/"
                                    className="mt-6 text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2"
                                >
                                    <ArrowLeft size={15} />
                                    Volver a iniciar sesión
                                </Link>
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
