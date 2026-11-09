import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { loginUseCase } from "../../aplicacion/auth/loginUseCase";
import { googleLoginUseCase } from "../../aplicacion/auth/googleLoginUseCase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ correo: "", password: "" });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLoginSuccess = (res) => {
        if (!res?.accessToken) {
            toast.error("No se pudo completar el inicio de sesión");
            return;
        }

        localStorage.setItem("token", res.accessToken);
        localStorage.setItem("user", JSON.stringify(res.user));

        const rol = res.user.Roles[0]?.nombre;
        localStorage.setItem("rolActivo", rol);

        toast.success("Inicio de sesión exitoso");

        switch (rol) {
            case "Administrador":        navigate("/periodos"); break;
            case "Director de programa": navigate("/homeDirector"); break;
            case "Empresa":              navigate("/subirConvenio"); break;
            case "Practicante":          navigate("/homePracticante"); break;
            case "Candidato":            navigate("/perfil"); break;
            case "Tutor Docente":        navigate("/misGrupos"); break;
            case "Tutor Empresarial":    navigate("/mis-aperturas"); break;
            default:                     navigate("/");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        try {
            const res = await loginUseCase(form);
            handleLoginSuccess(res);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (idToken) => {
        if (loading) return;

        setLoading(true);
        try {
            const res = await googleLoginUseCase(idToken);
            handleLoginSuccess(res);
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al iniciar sesión con Google");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        toast.error("No se pudo iniciar sesión con Google");
    };

    return (
        <LoginForm
            onSubmit={handleSubmit}
            onChange={handleChange}
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={handleGoogleError}
            loading={loading}
        />
    );
}