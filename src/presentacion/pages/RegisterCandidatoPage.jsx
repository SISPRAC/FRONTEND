import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CandidateForm from "../components/CandidatoForm";

import { registerCandidato } from "../../aplicacion/candidato/registerCandidato";
import { candidatoRepository } from "../../infraestructura/repository/candidatoRepository.js";

import { perfilRepository } from "../../infraestructura/repository/perfilRepository.js";
import { getPerfiles } from "../../aplicacion/perfil/getPerfiles";

import { validarInvitacionService } from "../../aplicacion/services/invitacionService";

import toast from "react-hot-toast";

export default function RegisterCandidatePage() {

  const navigate = useNavigate();

  const [params] = useSearchParams();

  // Token tomado directamente de la URL
  const token = params.get("token");


  const [valido, setValido] = useState(null);

  const [rol, setRol] = useState(null);


  const [form, setForm] = useState({
    codigo: "",
    cedula: "",
    correo: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    password: "",
    tipo_documento: "",
    cv: null,
  });


  const [errors, setErrors] = useState({});

  const [backendError, setBackendError] = useState("");

  const [listaPerfiles, setListaPerfiles] = useState([]);


  const [perfiles, setPerfiles] = useState([
    {
      perfil_id: "",
      calificacion: ""
    }
  ]);


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


          // Guardamos el rol de la invitación
          setRol(
            res.data.invitacion?.rol
          );


          // =================================================
          // CORREO DE LA INVITACIÓN
          // =================================================

          if (
            res.data.invitacion?.correo
          ) {

            setForm((prev) => ({
              ...prev,
              correo:
                res.data.invitacion.correo
            }));

          }


          // =================================================
          // CÓDIGO DE LA INVITACIÓN
          // =================================================

          if (
            res.data.invitacion?.codigo
          ) {

            setForm((prev) => ({
              ...prev,
              codigo:
                res.data.invitacion.codigo
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
  // CARGAR PERFILES
  // =========================================================

  useEffect(() => {

    const loadPerfiles = async () => {

      try {

        const perfiles =
          await getPerfiles({
            perfilRepository
          });


        setListaPerfiles(perfiles);

      } catch (error) {

        console.error(
          "Error cargando perfiles:",
          error
        );


        toast.error(
          "Error al cargar perfiles"
        );

      }

    };


    loadPerfiles();

  }, []);


  // =========================================================
  // AGREGAR PERFIL
  // =========================================================

  const addPerfil = () => {

    if (perfiles.length >= 2) {
      return;
    }


    setPerfiles([
      ...perfiles,
      {
        perfil_id: "",
        calificacion: ""
      }
    ]);

  };


  // =========================================================
  // ELIMINAR PERFIL
  // =========================================================

  const removePerfil = (index) => {

    setPerfiles(
      perfiles.filter(
        (_, i) => i !== index
      )
    );

  };


  // =========================================================
  // CAMBIAR PERFIL
  // =========================================================

  const handlePerfilChange = (
    index,
    field,
    value
  ) => {

    const updated = [
      ...perfiles
    ];


    updated[index][field] = value;


    setPerfiles(updated);

  };


  // =========================================================
  // CAMBIOS DEL FORMULARIO
  // =========================================================

  const handleChange = (e) => {

    let { name, value } = e.target;


    // =====================================================
    // NO MODIFICAR DATOS DE LA INVITACIÓN
    // =====================================================

    if (
      name === "correo" ||
      name === "codigo"
    ) {

      return;

    }


    // =====================================================
    // SOLO NÚMEROS
    // =====================================================

    if (
      name === "cedula" ||
      name === "telefono"
    ) {

      value = value.replace(
        /\D/g,
        ""
      );

    }


    // =====================================================
    // LÍMITE CÉDULA → 10
    // =====================================================

    if (name === "cedula") {

      value = value.slice(
        0,
        10
      );

    }


    // =====================================================
    // LÍMITE TELÉFONO → 10
    // =====================================================

    if (name === "telefono") {

      value = value.slice(
        0,
        10
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
  // SELECCIONAR CV
  // =========================================================

  const handleFileSelect = (file) => {

    setForm((prev) => ({
      ...prev,
      cv: file
    }));


    if (errors.cv) {

      setErrors((prev) => ({
        ...prev,
        cv: undefined
      }));

    }

  };


  // =========================================================
  // REGISTRAR CANDIDATO
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    const newErrors = {};


    // =====================================================
    // CAMPOS OBLIGATORIOS
    // =====================================================

    const camposObligatorios = [
      "codigo",
      "cedula",
      "correo",
      "nombres",
      "apellidos",
      "telefono",
      "password",
      "tipo_documento",
      "cv"
    ];


    camposObligatorios.forEach((key) => {

      if (!form[key]) {

        newErrors[key] =
          "Este campo es obligatorio";

      }

    });


    // =====================================================
    // CÉDULA
    // =====================================================

    if (
      form.cedula &&
      form.cedula.length > 10
    ) {

      newErrors.cedula =
        "La cédula no puede tener más de 10 dígitos";

    }


    // =====================================================
    // TELÉFONO
    // =====================================================

    if (
      form.telefono &&
      form.telefono.length !== 10
    ) {

      newErrors.telefono =
        "El teléfono debe tener 10 dígitos";

    }


    // =====================================================
    // CÓDIGO
    // =====================================================

    if (
      form.codigo &&
      form.codigo.length > 14
    ) {

      newErrors.codigo =
        "El código no puede tener más de 14 caracteres";

    }


    if (
      Object.keys(newErrors).length > 0
    ) {

      setErrors(newErrors);

      return;

    }


    // =====================================================
    // VALIDAR PERFILES
    // =====================================================

    const perfilInvalido =
      perfiles.some(
        (p) =>
          !p.perfil_id ||
          !p.calificacion
      );


    if (perfilInvalido) {

      toast.error(
        "Debe seleccionar un perfil y una calificación"
      );

      return;

    }


    // =====================================================
    // NO PERMITIR PERFILES REPETIDOS
    // =====================================================

    const ids = perfiles
      .map((p) => p.perfil_id)
      .filter(Boolean);


    if (
      new Set(ids).size !== ids.length
    ) {

      toast.error(
        "No puede seleccionar el mismo perfil dos veces"
      );

      return;

    }


    // =====================================================
    // REGISTRAR
    // =====================================================

    try {

      const data = new FormData();


      data.append(
        "tipo_documento",
        form.tipo_documento
      );

      data.append(
        "cedula",
        form.cedula
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
        "telefono",
        form.telefono
      );

      data.append(
        "password",
        form.password
      );


      // =================================================
      // DATOS DE LA INVITACIÓN
      // =================================================

      data.append(
        "codigo",
        form.codigo
      );

      data.append(
        "correo",
        form.correo
      );


      // =================================================
      // CV
      // =================================================

      data.append(
        "cv",
        form.cv
      );


      // =================================================
      // PERFILES
      // =================================================

      data.append(
        "perfiles",
        JSON.stringify(perfiles)
      );


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "Token de la URL:",
        token
      );


      console.log(
        "Datos enviados:"
      );


      for (
        let [key, value]
        of data.entries()
      ) {

        console.log(
          key,
          value
        );

      }


      // =================================================
      // REGISTRAR CANDIDATO + TOKEN
      // =================================================

      await registerCandidato(
        {
          candidatoRepository
        },
        data,
        token
      );


      toast.success(
        "Registro exitoso"
      );


      navigate("/");

    } catch (error) {

      console.error(
        "Error en registro:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        "Error en el registro"
      );

    }

  };


  // =========================================================
  // CONTROL DE ACCESO
  // =========================================================

  if (valido === null) {

    return (
      <p>
        Cargando...
      </p>
    );

  }


  if (valido === false) {

    return (
      <p>
        Token inválido o expirado
      </p>
    );

  }


  // =========================================================
  // FORMULARIO
  // =========================================================

  return (

    <CandidateForm
      form={form}

      onSubmit={handleSubmit}

      onChange={handleChange}

      handleFileSelect={handleFileSelect}

      errors={errors}

      backendError={backendError}

      perfiles={perfiles}

      listaPerfiles={listaPerfiles}

      addPerfil={addPerfil}

      removePerfil={removePerfil}

      handlePerfilChange={handlePerfilChange}
    />

  );

}