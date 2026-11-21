
import { Link } from "react-router-dom";
import {
    LoaderCircle,
    Mail,
    MailCheck,
    ArrowLeft,
    ShieldCheck
} from "lucide-react";
import AuthLayout from "../pages/Authlayout";

export default function ForgotPasswordForm({
    onSubmit,
    onChange,
    loading = false,
    enviado = false,
    error = ""
}) {
    return (
        <AuthLayout>
            <div className="w-full max-w-md mx-auto px-5 sm:px-6 py-6">

                {enviado ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5">
                            <MailCheck size={32} className="text-red-600" />
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Revisa tu correo
                        </h2>

                        <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm">
                            Si el correo está registrado, te enviamos un enlace
                            para restablecer tu contraseña. El enlace es válido
                            por 15 minutos.
                        </p>

                        <Link
                            to="/"
                            className="w-full max-w-xs h-11 rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-all flex items-center justify-center"
                        >
                            Volver a iniciar sesión
                        </Link>
                    </div>
                ) : (
                    <form
                        className="flex flex-col items-center w-full"
                        onSubmit={onSubmit}
                    >
                        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <ShieldCheck size={25} className="text-red-600" />
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-2">
                            Recuperar contraseña
                        </h2>

                        <p className="text-sm text-gray-500 text-center leading-relaxed mb-7 max-w-sm">
                            Ingresa tu correo electrónico y te enviaremos
                            un enlace para crear una nueva contraseña.
                        </p>

                        <div className="w-full">
                            <label
                                htmlFor="correo"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Correo electrónico
                            </label>

                            <div className="flex items-center w-full h-11 bg-white border border-gray-300 rounded-xl px-4 gap-3 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all">
                                <Mail size={17} className="text-gray-400 shrink-0" />

                                <input
                                    id="correo"
                                    type="email"
                                    name="correo"
                                    placeholder="ejemplo@correo.com"
                                    className="w-full h-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className={`mt-5 w-full h-11 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2
                                ${
                                    loading
                                        ? "bg-red-400 cursor-not-allowed"
                                        : "bg-red-600 hover:bg-red-700 active:scale-[0.98]"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle size={18} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                "Enviar enlace"
                            )}
                        </button>

                        <Link
                            to="/"
                            className="mt-5 text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center gap-2"
                        >
                            <ArrowLeft size={15} />
                            Volver a iniciar sesión
                        </Link>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
