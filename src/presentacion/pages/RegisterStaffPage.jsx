
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StaffForm from "../components/StaffForm";
import { registerStaffService } from "../../aplicacion/services/registerService";
import { validarInvitacionService } from "../../aplicacion/services/invitacionService";
import toast from "react-hot-toast";
import {
  normalizarNombre,
  normalizarCargo,
} from "../components/utils/normalizarTexto";

import {
  LoaderCircle,
  ShieldAlert,
  Clock3,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

const MIN_PASSWORD = 8;

export default function RegisterStaffPage() {

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [valido, setValido] = useState(null);
  const [rol, setRol] = useState(null);
  const [loading, setLoading] = useState(false);

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
          setRol(res.data.invitacion?.rol);

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

    if (name === "cedula" || name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    if (name === "telefono") {
      value = value.slice(0, 10);
    }

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

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (loading) return;

    const newErrors = {};

    const camposObligatorios = [
      "tipo_documento",
      "cedula",
      "nombres",
      "apellidos",
      "telefono",
      "password"
    ];

    camposObligatorios.forEach((key) => {
      if (!form[key]?.toString().trim()) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });

    if (form.telefono && form.telefono.length !== 10) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos";
    }

    if (form.password && form.password.length < MIN_PASSWORD) {
      newErrors.password = `La contraseña debe tener mínimo ${MIN_PASSWORD} caracteres`;
    }

    if (rol === "Tutor Docente" && !form.codigo) {
      newErrors.codigo = "El código es obligatorio";
    }

    if (rol === "Tutor Empresarial" && !form.cargo?.trim()) {
      newErrors.cargo = "El cargo es obligatorio";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    setLoading(true);

    try {

      const data = new FormData();

      data.append("tipo_documento", form.tipo_documento);
      data.append("cedula", form.cedula);
      data.append("nombres", normalizarNombre(form.nombres));
      data.append("apellidos", normalizarNombre(form.apellidos));
      data.append("telefono", form.telefono);
      data.append("password", form.password);

      if (rol === "Tutor Docente") {
        data.append("codigo", form.codigo);
      }

      if (rol === "Tutor Empresarial") {
        data.append("cargo", normalizarCargo(form.cargo));
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
                para completar tu registro.
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


  return (
    <StaffForm
      form={form}
      rol={rol}
      onSubmit={handleSubmit}
      onChange={handleChange}
      errors={errors}
      loading={loading}
    />
  );

}
