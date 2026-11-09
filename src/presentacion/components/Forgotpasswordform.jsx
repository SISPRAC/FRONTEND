import { Link } from "react-router-dom";
import { LoaderCircle, Mail, MailCheck, ArrowLeft } from "lucide-react";
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

            {enviado ? (

                <div className="flex flex-col items-center justify-center text-center mt-6 ml-12 mb-12">

                    <MailCheck size={56} className="text-red-600 mb-4" />

                    <h2 className="text-3xl text-gray-900 font-medium mb-3">
                        Revisa tu correo
                    </h2>

                    <p className="text-sm text-gray-500/90 mb-6">
                        Si el correo está registrado, te enviamos un enlace
                        para restablecer tu contraseña. El enlace es válido
                        por 15 minutos.
                    </p>

                    <Link
                        to="/"
                        className="w-full h-11 rounded-full text-white bg-red-600 hover:opacity-90 transition-all flex items-center justify-center"
                    >
                        Volver a iniciar sesión
                    </Link>

                </div>

            ) : (

                <form
                    className="flex flex-col items-center justify-center mt-6 ml-12 mb-12"
                    onSubmit={onSubmit}
                >
                    <h2 className="text-4xl text-gray-900 font-medium mb-3">
                        Recuperar contraseña
                    </h2>

                    <p className="text-sm text-gray-500/90 mt-3 mb-6 text-center">
                        Ingresa tu correo y te enviaremos un enlace para
                        crear una nueva contraseña
                    </p>

                    {/* Correo */}
                    <div className="flex items-center w-full bg-white bg-transparent border border-black-900 h-12 rounded-full overflow-hidden pl-6 gap-2">

                        <Mail size={16} className="text-gray-500" />

                        <input
                            type="email"
                            name="correo"
                            placeholder="Correo electrónico"
                            className="ml-2 bg-white bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full"
                            required
                            onChange={onChange}
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <p className="w-full mt-4 text-sm text-red-600 text-center">
                            {error}
                        </p>
                    )}

                    {/* Botón enviar */}
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
                                Enviando...
                            </>
                        ) : (
                            "Enviar enlace"
                        )}
                    </button>

                    <Link
                        to="/"
                        className="mt-6 text-sm text-gray-500/90 underline flex items-center gap-1"
                    >
                        <ArrowLeft size={14} />
                        Volver a iniciar sesión
                    </Link>

                </form>

            )}

        </AuthLayout>
    );
}