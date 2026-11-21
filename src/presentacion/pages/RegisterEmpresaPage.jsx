
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EmpresaForm, { normalizarNombre } from "../components/EmpresaForm";

import { registerEmpresa } from "../../aplicacion/empresa/RegistrarEmpresa.js";
import { EmpresaRepository } from "../../infraestructura/repository/empresaRepository.js";
import { validarInvitacionService } from "../../aplicacion/services/invitacionService";

import toast from "react-hot-toast";

import {
  LoaderCircle,
  ShieldAlert,
  Clock3,
  ArrowLeft,
} from "lucide-react";

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

  // TOKEN DE LA URL
  const token = params.get("token");

  // ESTADOS
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
    es_publica: true,
    descripcion_perfil: "",
    logo: null,
  });

  const [errors, setErrors] = useState({});

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

  // CAMBIOS DEL FORMULARIO
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

  // SELECCIONAR LOGO
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

  // REGISTRAR EMPRESA
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const newErrors = {};

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
      data.append("es_publica", String(form.es_publica));
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

  // PANTALLA DE CARGA
  if (valido === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 w-full max-w-sm text-center">

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
              <LoaderCircle
                size={34}
                className="text-red-600 animate-spin"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Verificando invitación
          </h2>

          <p className="text-sm text-gray-500">
            Estamos comprobando la validez de tu enlace.
            Esto tomará solo unos segundos.
          </p>

          <div className="mt-7 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-red-600 rounded-full animate-pulse" />
          </div>

        </div>

      </div>
    );
  }

  // TOKEN INVÁLIDO O EXPIRADO
  if (valido === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 w-full max-w-md text-center">

          {/* ICONO */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldAlert
                size={42}
                className="text-red-600"
                strokeWidth={1.7}
              />
            </div>
          </div>

          {/* TÍTULO */}
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Invitación no disponible
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            El enlace de invitación que intentas utilizar es inválido,
            ha expirado o ya fue utilizado. Por motivos de seguridad,
            no es posible continuar con el registro.
          </p>

          {/* INFORMACIÓN */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-7 flex items-start gap-3 text-left">

            <Clock3
              size={21}
              className="text-red-600 shrink-0 mt-0.5"
            />

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-1">
                Enlace vencido o inválido
              </p>

              <p className="text-xs text-gray-600 leading-relaxed">
                Solicita al administrador que genere una nueva invitación
                para completar el registro de tu empresa.
              </p>
            </div>

          </div>

          {/* BOTÓN */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-200 shadow-md shadow-red-200"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </button>

          <p className="text-xs text-gray-400 mt-6">
            Si consideras que se trata de un error, comunícate con el administrador.
          </p>

        </div>

      </div>
    );
  }

  // FORMULARIO
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
