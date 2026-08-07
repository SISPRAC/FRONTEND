import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmpresaForm from "../components/EmpresaForm";
import { registerEmpresa } from "../../aplicacion/empresa/RegistrarEmpresa.js";
import { EmpresaRepository } from "../../infraestructura/repository/empresaRepository.js"
import toast from "react-hot-toast";

export default function RegisterEmpresaPage() {
  const navigate = useNavigate();
 const [form, setForm] = useState({
    nit: "",
    nombre: "",
    nombres: "",
    apellidos: "",
    cedula: "",
    correo: "",
    direccion: "",
    telefono: "",
    password: "",
    tipo_documento: "",
    logo: null,
});

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔒 SOLO NÚMEROS
    if (name === "nit" || name === "cedula" || name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    // 🔒 SOLO LETRAS (y espacios)
    if (name === "nombres" || name === "apellidos") {
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

  const handleFileSelect = (file) => {
    setForm({ ...form, logo: file });
    if (errors.logo) {
      setErrors({ ...errors, logo: undefined });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    Object.keys(form).forEach((key) => {
      // El logo se valida aparte
      if (key !== "logo" && !form[key]) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });

    // Validar logo
    if (!form.logo) {
      newErrors.logo = "El logo de la empresa es obligatorio";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {

      const data = new FormData();

      // Datos de texto
      data.append("nit", form.nit);
      data.append("nombre", form.nombre);
      data.append("nombres", form.nombres);
      data.append("apellidos", form.apellidos);
      data.append("cedula", form.cedula);
      data.append("correo", form.correo);
      data.append("direccion", form.direccion);
      data.append("telefono", form.telefono);
      data.append("password", form.password);
      data.append("tipo_documento", form.tipo_documento);

      // Archivo
      data.append("logo", form.logo);

      await registerEmpresa(
        { EmpresaRepository },
        data
      );

      toast.success("Registro exitoso");
      navigate("/");

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error en el registro"
      );
    }
  };

  return (
    <EmpresaForm
      form={form}
      onSubmit={handleSubmit}
      onChange={handleChange}
      handleFileSelect={handleFileSelect}
      errors={errors}
      backendError={backendError}
    />
  );
}