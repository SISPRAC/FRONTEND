import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EmpresaForm from "../components/EmpresaForm";

import { registerEmpresa } from "../../aplicacion/empresa/RegistrarEmpresa.js";
import { EmpresaRepository } from "../../infraestructura/repository/empresaRepository.js";
import { validarInvitacionService } from "../../aplicacion/services/invitacionService";

import toast from "react-hot-toast";


export default function RegisterEmpresaPage() {

  const navigate = useNavigate();

  const [params] = useSearchParams();

  // =========================================================
  // TOKEN DE LA URL
  // =========================================================

  const token = params.get("token");

  console.log("Token de la URL:", token);


  // =========================================================
  // ESTADOS
  // =========================================================

  const [valido, setValido] = useState(null);

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

        const res =
          await validarInvitacionService(token);

        console.log(
          "Respuesta validación invitación:",
          res.data
        );


        if (res.data.valid) {

          setValido(true);


          // =================================================
          // DATOS DE LA INVITACIÓN
          // =================================================

          const invitacion =
            res.data.invitacion;


          // =================================================
          // CORREO DE LA INVITACIÓN
          // =================================================

          if (invitacion?.correo) {

            setForm((prev) => ({
              ...prev,
              correo: invitacion.correo
            }));

          }

        } else {

          setValido(false);

        }

      } catch (error) {

        console.error(
          "Error validando invitación:",
          error
        );

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


    // =====================================================
    // CORREO VIENE DE LA INVITACIÓN
    // =====================================================

    if (name === "correo") {

      return;

    }


    // =====================================================
    // SOLO NÚMEROS
    // =====================================================

    if (
      name === "nit" ||
      name === "cedula" ||
      name === "telefono"
    ) {

      value = value.replace(
        /\D/g,
        ""
      );

    }


    // =====================================================
    // SOLO LETRAS
    // =====================================================

    if (
      name === "nombres" ||
      name === "apellidos"
    ) {

      value = value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
        ""
      );

    }


    // =====================================================
    // ACTUALIZAR FORMULARIO
    // =====================================================

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));


    // =====================================================
    // LIMPIAR ERROR
    // =====================================================

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
      logo: file
    }));


    if (errors.logo) {

      setErrors((prev) => ({
        ...prev,
        logo: undefined
      }));

    }

  };


  // =========================================================
  // REGISTRAR EMPRESA
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    const newErrors = {};


    // =====================================================
    // CAMPOS OBLIGATORIOS
    // =====================================================

    Object.keys(form).forEach((key) => {

      // El logo se valida aparte

      if (
        key !== "logo" &&
        !form[key]
      ) {

        newErrors[key] =
          "Este campo es obligatorio";

      }

    });


    // =====================================================
    // VALIDAR LOGO
    // =====================================================

    if (!form.logo) {

      newErrors.logo =
        "El logo de la empresa es obligatorio";

    }


    // =====================================================
    // MOSTRAR ERRORES
    // =====================================================

    if (
      Object.keys(newErrors).length > 0
    ) {

      setErrors(newErrors);

      return;

    }


    // =====================================================
    // REGISTRO
    // =====================================================

    try {

      const data = new FormData();


      // =====================================================
      // DATOS DE LA EMPRESA
      // =====================================================

      data.append(
        "nit",
        form.nit
      );

      data.append(
        "nombre",
        form.nombre
      );

      data.append(
        "nombres",
        form.nombres
      );

      data.append(
        "apellidos",
        form.apellidos
      );

      data.append(
        "cedula",
        form.cedula
      );

      data.append(
        "correo",
        form.correo
      );

      data.append(
        "direccion",
        form.direccion
      );

      data.append(
        "telefono",
        form.telefono
      );

      data.append(
        "password",
        form.password
      );

      data.append(
        "tipo_documento",
        form.tipo_documento
      );


      // =====================================================
      // LOGO
      // =====================================================

      data.append(
        "logo",
        form.logo
      );


      // =====================================================
      // DEBUG
      // =====================================================

      console.log(
        "Datos enviados:"
      );

      for (
        const [key, value]
        of data.entries()
      ) {

        console.log(
          key,
          value
        );

      }


      // =====================================================
      // REGISTRAR + TOKEN
      // =====================================================

      await registerEmpresa(
        {
          EmpresaRepository
        },
        data,
        token
      );


      // =====================================================
      // ÉXITO
      // =====================================================

      toast.success(
        "Registro exitoso"
      );

      navigate("/");

    } catch (error) {

      console.error(
        "Error en registro:",
        error
      );


      const mensaje =
        error.response?.data?.message ||
        "Error en el registro";


      toast.error(mensaje);


      setBackendError(mensaje);

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
      backendError={backendError}
    />
  );

}