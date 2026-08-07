import { useState } from "react";
import LoginForm from "../components/LoginForm";
import { loginUseCase } from "../../aplicacion/auth/loginUseCase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LoginPage() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        correo: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await loginUseCase(form);

            if (res.accessToken) {
                localStorage.setItem("token", res.accessToken);
                localStorage.setItem("user", JSON.stringify(res.user));

                toast.success("Inicio de sesión exitoso");

                const rol = res.user.Roles[0]?.nombre;

                switch (rol) {
                    case "Administrador":
                        navigate("/homeAdmin");
                        break;

                    case "Director de programa":
                        navigate("/homeDirector");
                        break;

                    case "Empresa":
                        navigate("/homeEmpresa");
                        break;

                    case "Practicante":
                        navigate("/homePracticante");
                        break;

                    case "Candidato":
                        navigate("/homeCandidato");
                        break;

                    case "Tutor Docente":
                        navigate("/homeTutorDocente");
                        break;

                    case "Tutor Empresarial":
                        navigate("/homeTutorEmpresarial");
                        break;

                    default:
                        navigate("/");
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Error al iniciar sesión");
        }
    };

    return (
        <LoginForm
            onSubmit={handleSubmit}
            onChange={handleChange}
        />
    );
}