import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StaffForm from "../components/StaffForm";
import { registerStaffService } from "../../aplicacion/services/registerService";
import { validarInvitacionService } from "../../aplicacion/services/invitacionService";
import toast from "react-hot-toast";

export default function RegisterStaffPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [valido, setValido] = useState(null);

  const [form, setForm] = useState({
    cedula: "",
    username: "",
    email: "",
    telefono: "",
    password: "",
  });

  // 🔹 VALIDAR TOKEN AL ENTRAR
  useEffect(() => {
    if (!token) {
      setValido(false);
      return;
    }

    const validar = async () => {
  try {
    const res = await validarInvitacionService(token);
    if (res.data.valid) {
      setValido(true);
    } else {
      setValido(false);
    }

  } catch {
    setValido(false);
  }
};

    validar();
  }, [token]);

   const [errors, setErrors] = useState({});
   const [backendError, setBackendError] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔒 SOLO NÚMEROS
    if (name === "cedula" || name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    // 🔒 SOLO LETRAS (y espacios)
    if (name === "username" ) {
      value = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // limpiar error si ya está corrigiendo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // 🔹 SUBMIT
  const handleSubmit = async (e) => {
  e.preventDefault();
   const newErrors = {};
  Object.keys(form).forEach((key) => {
    if (!form[key]) {
      newErrors[key] = "Este campo es obligatorio";
    }
  });

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });
  for (let [key, value] of data.entries()) {
  console.log(key, value);
}

    await registerStaffService(data, token);

    toast.success("Registro exitoso");
    navigate("/");

  } catch (error) {
     toast.error(error.response?.data?.message || "Error en el registro");
  }
};
  // 🔹 CONTROL DE ACCESO
  if (valido === null) return <p>Cargando...</p>;
  if (valido === false) return <p>Token inválido o expirado</p>;

  return (
    <StaffForm  
     form ={form}
      onSubmit={handleSubmit}
      onChange={handleChange}
      errors={errors}
      backendError={backendError}
    />
  );
}