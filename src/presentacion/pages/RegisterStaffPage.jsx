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
  const [rol, setRol] = useState(null);

  const [form, setForm] = useState({
    tipo_documento: "CC",
    cedula: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    codigo: "",
    cargo: ""
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  // VALIDAR TOKEN AL ENTRAR
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

          // Guardamos el rol de la invitación
          setRol(res.data.invitacion?.rol);

          // El correo viene de la invitación
          if (res.data.invitacion?.correo) {
            setForm((prev) => ({
              ...prev,
              email: res.data.invitacion.correo
            }));
          }

        } else {

          setValido(false);

        }

      } catch (error) {

        console.error("Error validando invitación:", error);

        setValido(false);

      }
    };

    validar();

  }, [token]);


  const handleChange = (e) => {

    let { name, value } = e.target;

    // SOLO NÚMEROS
    if (name === "cedula" || name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    // LÍMITE DE 10 DÍGITOS EN TELÉFONO
    if (name === "telefono") {
      value = value.slice(0, 10);
    }

    // SOLO LETRAS
    if (name === "nombres" || name === "apellidos") {
      value = value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
        ""
      );
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error del campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    const newErrors = {};

    // Validaciones generales
    const camposObligatorios = [
      "tipo_documento",
      "cedula",
      "nombres",
      "apellidos",
      "telefono",
      "password"
    ];

    camposObligatorios.forEach((key) => {

      if (!form[key]) {
        newErrors[key] = "Este campo es obligatorio";
      }

    });

    // Teléfono → debe tener exactamente 10 dígitos
    if (form.telefono && form.telefono.length !== 10) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos";
    }


    // Tutor Docente → código obligatorio
    if (rol === "Tutor Docente" && !form.codigo) {
      newErrors.codigo = "El código es obligatorio";
    }


    // Tutor Empresarial → cargo obligatorio
    if (rol === "Tutor Empresarial" && !form.cargo) {
      newErrors.cargo = "El cargo es obligatorio";
    }


    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);
      return;

    }


    try {

      const data = new FormData();

      data.append("tipo_documento", form.tipo_documento);
      data.append("cedula", form.cedula);
      data.append("nombres", form.nombres);
      data.append("apellidos", form.apellidos);
      data.append("telefono", form.telefono);
      data.append("password", form.password);

      // Tutor Docente
      if (rol === "Tutor Docente") {
        data.append("codigo", form.codigo);
      }

      // Tutor Empresarial
      if (rol === "Tutor Empresarial") {
        data.append("cargo", form.cargo);
      }


      console.log("Datos enviados:");

      for (let [key, value] of data.entries()) {
        console.log(key, value);
      }


      await registerStaffService(data, token);

      toast.success("Registro exitoso");

      navigate("/");

    } catch (error) {

      console.error("Error en registro:", error);

      toast.error(
        error.response?.data?.message ||
        "Error en el registro"
      );

    }

  };


  // CONTROL DE ACCESO
  if (valido === null) {
    return <p>Cargando...</p>;
  }

  if (valido === false) {
    return <p>Token inválido o expirado</p>;
  }


  return (
    <StaffForm
      form={form}
      rol={rol}
      onSubmit={handleSubmit}
      onChange={handleChange}
      errors={errors}
      backendError={backendError}
    />
  );

}