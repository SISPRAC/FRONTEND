import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ResetPasswordForm from "../components/ResetPasswordForm.jsx";
import { resetPassword } from "../../aplicacion/auth/resetpassword.js";
import { passwordResetRepository } from "../../infraestructura/repository/PasswordresetRepository.js";

export default function ResetPasswordPage() {

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // El token viene en el enlace del correo: /restablecer-password?token=...
    const token = searchParams.get("token");

    const [form, setForm] = useState({
        nuevaPassword: "",
        confirmarPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [exito, setExito] = useState(false);
    const [error, setError] = useState("");

    // Tras el éxito, redirige al login
    useEffect(() => {
        if (!exito) return;
        const timer = setTimeout(() => navigate("/"), 3000);
        return () => clearTimeout(timer);
    }, [exito, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await resetPassword(
                { passwordResetRepository },
                { token, ...form }
            );
            setExito(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "No se pudo cambiar la contraseña"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <ResetPasswordForm
            onSubmit={handleSubmit}
            onChange={handleChange}
            loading={loading}
            exito={exito}
            tokenValido={Boolean(token)}
            error={error}
        />
    );
}