import { useState } from "react";
import ForgotPasswordForm from "../components/ForgotPasswordForm.jsx";
import { forgotPassword } from "../../aplicacion/auth/forgotpassword.js";
import { passwordResetRepository } from "../../infraestructura/repository/PasswordresetRepository.js";

export default function ForgotPasswordPage() {

    const [form, setForm] = useState({ correo: "" });
    const [loading, setLoading] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await forgotPassword({ passwordResetRepository }, form);
            setEnviado(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "No se pudo procesar la solicitud"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ForgotPasswordForm
            onSubmit={handleSubmit}
            onChange={handleChange}
            loading={loading}
            enviado={enviado}
            error={error}
        />
    );
}