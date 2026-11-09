import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EmpresaForm, { normalizarNombre } from "../components/EmpresaForm";

import { registerEmpresa } from "../../aplicacion/empresa/RegistrarEmpresa.js";
import { EmpresaRepository } from "../../infraestructura/repository/empresaRepository.js";
import { validarInvitacionService } from "../../aplicacion/services/invitacionService";

import toast from "react-hot-toast";

// Campos de texto que no pueden ir vacíos (el logo se valida aparte)
const CAMPOS_OBLIGATORIOS = [
  "nit",
  "nombre",
  "nombres",
  "apellidos",
  "cedula",
  "correo",
  "direccion",
  "telefono",
  "password",
  "tipo_documento",
  "descripcion_perfil",
];

export default function RegisterEmpresaPage() {
  const navigate = useNavigate();

  const [params] = useSearchParams();

  // =========================================================
  // TOKEN DE LA URL
  // =========================================================

  const token = params.get("token");

  // =========================================================
  // ESTADOS
  // =========================================================

  const [valido, setValido] = useState(null);

  const [loading, setLoading] = useState(false);

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
    tipo_documento: "CC",
    es_publica: true, // por defecto la empresa inicia como pública
    descripcion_perfil: "",
    logo: null,
  });

  const [errors, setErrors] = useState({});

  // =========================================================
  // VALIDAR TOKEN AL ENTRAR
  // =========================================================

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

          // Correo de la invitación
          const invitacion = res.data.invitacion;

          if (invitacion?.correo) {
            setForm((prev) => ({
              ...prev,
              correo: invitacion.correo,
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

  // =========================================================
  // CAMBIOS DEL FORMULARIO
  // =========================================================

  const handleChange = (e) => {
    let { name, value } = e.target;

    // El correo viene de la invitación
    if (name === "correo") {
      return;
    }

    // Solo números
    if (name === "nit" || name === "cedula" || name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    // Solo letras
    if (name === "nombres" || name === "apellidos") {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
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

  // =========================================================
  // SELECCIONAR LOGO
  // =========================================================

  const handleFileSelect = (file) => {
    setForm((prev) => ({
      ...prev,
      logo: file,
    }));

    if (errors.logo) {
      setErrors((prev) => ({
        ...prev,
        logo: undefined,
      }));
    }
  };

  // =========================================================
  // REGISTRAR EMPRESA
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};

    // Campos obligatorios
    CAMPOS_OBLIGATORIOS.forEach((key) => {
      if (!String(form[key] ?? "").trim()) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });

    // Logo
    if (!form.logo) {
      newErrors.logo = "El logo de la empresa es obligatorio";
    }

    // Mostrar errores
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      const soloLogo =
        Object.keys(newErrors).length === 1 && newErrors.logo;

      toast.error(
        soloLogo
          ? newErrors.logo
          : "Completa todos los campos obligatorios"
      );

      return;
    }

    // Registro
    setLoading(true);

    try {
      const data = new FormData();

      data.append("nit", form.nit);
      data.append("nombre", form.nombre.trim());
      data.append("nombres", normalizarNombre(form.nombres));
      data.append("apellidos", normalizarNombre(form.apellidos));
      data.append("cedula", form.cedula);
      data.append("correo", form.correo);
      data.append("direccion", form.direccion.trim());
      data.append("telefono", form.telefono);
      data.append("password", form.password);
      data.append("tipo_documento", form.tipo_documento);
      data.append("es_publica", String(form.es_publica)); // "true" | "false"
      data.append("descripcion_perfil", form.descripcion_perfil.trim());
      data.append("logo", form.logo);

      await registerEmpresa(
        {
          EmpresaRepository,
        },
        data,
        token
      );

      toast.success("Registro exitoso");

      navigate("/");
    } catch (error) {
      console.error("Error en registro:", error);

      const mensaje =
        error.response?.data?.message || "Error en el registro";

      toast.error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CARGANDO
  // =========================================================

  if (valido === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-700 font-semibold">
          Validando invitación...
        </p>
      </div>
    );
  }

  // =========================================================
  // TOKEN INVÁLIDO
  // =========================================================

  if (valido === false) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            Invitación no disponible
          </h1>

          <p className="text-gray-600">
            El enlace de invitación no es válido o ha expirado.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // FORMULARIO
  // =========================================================

  return (
    <EmpresaForm
      form={form}
      onSubmit={handleSubmit}
      onChange={handleChange}
      handleFileSelect={handleFileSelect}
      errors={errors}
      loading={loading}
    />
  );
}