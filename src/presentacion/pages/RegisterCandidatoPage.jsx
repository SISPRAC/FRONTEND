import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LoaderCircle,
  ShieldAlert,
  Clock3,
  ArrowLeft,
} from "lucide-react";

import CandidateForm from "../components/CandidatoForm";

import { registerCandidato } from "../../aplicacion/candidato/registerCandidato";
import { candidatoRepository } from "../../infraestructura/repository/candidatoRepository.js";

import { perfilRepository } from "../../infraestructura/repository/perfilRepository.js";
import { getPerfiles } from "../../aplicacion/perfil/getPerfiles";

import { habilidadBlandaRepository } from "../../infraestructura/repository/habilidadBlandaRepository.js";
import { getHabilidadesBlandas } from "../../aplicacion/habilidadesBlandas/getHabilidadesBlandas.js";

import { idiomaRepository } from "../../infraestructura/repository/idiomaRepository.js";
import { getIdiomas } from "../../aplicacion/idiomas/getIdiomas.js";

import { validarInvitacionService } from "../../aplicacion/services/invitacionService";

import toast from "react-hot-toast";

const esIngles = (nombre = "") =>
  nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").startsWith("ingl");

export default function RegisterCandidatePage() {

  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = params.get("token");

  const [valido, setValido] = useState(null);
  const [rol, setRol] = useState(null);

  const [form, setForm] = useState({
    codigo: "",
    cedula: "",
    correo: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    telefono: "",
    password: "",
    tipo_documento: "CC",
    cv: null,
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");

  // =========================================================
  // CATÁLOGOS
  // =========================================================

  const [listaPerfiles, setListaPerfiles] = useState([]);
  const [listaHabilidadesBlandas, setListaHabilidadesBlandas] = useState([]);
  const [listaIdiomas, setListaIdiomas] = useState([]);

  // =========================================================
  // PERFILES TÉCNICOS
  // =========================================================

  const [perfiles, setPerfiles] = useState([
    {
      perfil_id: "",
      nivel: ""
    }
  ]);

  const nivelesPerfil = [
    { value: "R", label: "Regular" },
    { value: "B", label: "Bien" },
    { value: "MB", label: "Muy bien" }
  ];

  // =========================================================
  // HABILIDADES BLANDAS
  // =========================================================

  const [habilidadesBlandas, setHabilidadesBlandas] = useState([]);

  // =========================================================
  // IDIOMAS
  // =========================================================

  const [idiomas, setIdiomas] = useState([]);

  const nivelesIdioma = [
    { value: "A1", label: "A1 - Principiante" },
    { value: "A2", label: "A2 - Básico" },
    { value: "B1", label: "B1 - Intermedio" },
    { value: "B2", label: "B2 - Intermedio alto" },
    { value: "C1", label: "C1 - Avanzado" },
    { value: "C2", label: "C2 - Dominio" },
    { value: "NATIVO", label: "Nativo" }
  ];

  // =========================================================
  // VALIDAR INVITACIÓN
  // =========================================================

  useEffect(() => {

    if (!token) {
      setValido(false);
      return;
    }

    const validar = async () => {

      try {

        const res = await validarInvitacionService(token);

        console.log(
          "Respuesta validación invitación:",
          res.data
        );

        if (res.data.valid) {

          setValido(true);

          setRol(res.data.invitacion?.rol);

          if (res.data.invitacion?.correo) {

            setForm((prev) => ({
              ...prev,
              correo: res.data.invitacion.correo
            }));

          }

          if (res.data.invitacion?.codigo) {

            setForm((prev) => ({
              ...prev,
              codigo: res.data.invitacion.codigo
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
  // CARGAR CATÁLOGOS
  // =========================================================

  useEffect(() => {

    const loadCatalogos = async () => {

      try {

        const [
          perfiles,
          habilidades,
          idiomas
        ] = await Promise.all([

          getPerfiles({
            perfilRepository
          }),

          getHabilidadesBlandas({
            habilidadBlandaRepository
          }),

          getIdiomas({
            idiomaRepository
          })

        ]);

        setListaPerfiles(perfiles);
        setListaHabilidadesBlandas(habilidades);
        setListaIdiomas(idiomas);

        // Inglés es obligatorio: se precarga la fila
        const ingles = idiomas.find((i) => esIngles(i.nombre));

        if (ingles) {
          setIdiomas((prev) =>
            prev.length > 0
              ? prev
              : [{ idioma_id: ingles.id, lee: "", habla: "", escucha: "" }]
          );
        }

      } catch (error) {

        console.error("Error cargando catálogos:", error);

        toast.error("Error al cargar las opciones del perfil");

      }

    };

    loadCatalogos();

  }, []);

  useEffect(() => {
    setErrors((prev) => (prev.perfiles ? { ...prev, perfiles: undefined } : prev));
  }, [perfiles]);

  useEffect(() => {
    setErrors((prev) => (prev.habilidades ? { ...prev, habilidades: undefined } : prev));
  }, [habilidadesBlandas]);

  useEffect(() => {
    setErrors((prev) => (prev.idiomas ? { ...prev, idiomas: undefined } : prev));
  }, [idiomas]);

  // =========================================================
  // PERFILES TÉCNICOS
  // =========================================================

  // Sin límite de perfiles
  const addPerfil = () =>
    setPerfiles((prev) => [...prev, { perfil_id: "", nivel: "" }]);

  // Ahora recibe la habilidad que se tocó
  const addHabilidadBlanda = (h = {}) =>
    setHabilidadesBlandas((prev) => [
      ...prev,
      { habilidad_blanda_id: h.habilidad_blanda_id ?? "", nombre: h.nombre ?? "" }
    ]);

  const removePerfil = (index) => {

    setPerfiles((prev) =>
      prev.filter((_, i) => i !== index)
    );

  };

  const handlePerfilChange = (index, field, value) => {

    setPerfiles((prev) =>
      prev.map((perfil, i) =>
        i === index
          ? { ...perfil, [field]: value }
          : perfil
      )
    );

  };


  const removeHabilidadBlanda = (index) => {

    setHabilidadesBlandas((prev) =>
      prev.filter((_, i) => i !== index)
    );

  };

  const handleHabilidadBlandaChange = (index, field, value) => {

    setHabilidadesBlandas((prev) =>
      prev.map((habilidad, i) => {

        if (i !== index) return habilidad;

        const actualizada = {
          ...habilidad,
          [field]: value
        };

        if (field === "habilidad_blanda_id") {
          actualizada.nombre = "";
        }

        if (field === "nombre") {
          actualizada.habilidad_blanda_id = "";
        }

        return actualizada;

      })
    );

  };

  // =========================================================
  // IDIOMAS
  // =========================================================

  const addIdioma = () => {

    setIdiomas((prev) => [
      ...prev,
      {
        idioma_id: "",
        lee: "",
        habla: "",
        escucha: ""
      }
    ]);

  };

  const removeIdioma = (index) => {

    setIdiomas((prev) =>
      prev.filter((_, i) => i !== index)
    );

  };

  const handleIdiomaChange = (index, field, value) => {

    setIdiomas((prev) =>
      prev.map((idioma, i) =>
        i === index
          ? { ...idioma, [field]: value }
          : idioma
      )
    );

  };

  // =========================================================
  // CAMBIOS DEL FORMULARIO
  // =========================================================

  const handleChange = (e) => {

    let { name, value } = e.target;

    if (name === "correo" || name === "codigo") {
      return;
    }

    // Solo números
    if (name === "cedula" || name === "telefono") {
      value = value.replace(/\D/g, "");
    }

    // Límite cédula
    if (name === "cedula") {
      value = value.slice(0, 10);
    }

    // Límite teléfono
    if (name === "telefono") {
      value = value.slice(0, 10);
    }

    // Solo letras en nombres y apellidos
    if (
      name === "primer_nombre" ||
      name === "segundo_nombre" ||
      name === "primer_apellido" ||
      name === "segundo_apellido"
    ) {
      value = value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g,
        ""
      );
    }

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {

      setErrors((prev) => ({
        ...prev,
        [name]: undefined
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
  // VALIDAR FORMULARIO
  // =========================================================

  const validarFormulario = () => {

    const newErrors = {};

    const camposObligatorios = [
      "codigo",
      "cedula",
      "correo",
      "primer_nombre",
      "primer_apellido",
      "segundo_apellido",
      "telefono",
      "password",
      "tipo_documento",
      "cv"
    ];

    camposObligatorios.forEach((key) => {

      if (!String(form[key] ?? "").trim()) {
        newErrors[key] = "Este campo es obligatorio";
      }

    });

    if (form.cedula && form.cedula.length > 10) {
      newErrors.cedula = "La cédula no puede tener más de 10 dígitos";
    }

    if (form.telefono && form.telefono.length !== 10) {
      newErrors.telefono = "El teléfono debe tener 10 dígitos";
    }

    if (form.codigo && form.codigo.length > 14) {
      newErrors.codigo = "El código no puede tener más de 14 caracteres";
    }

    if (form.password && form.password.length < 8) {
      newErrors.password = "La contraseña debe tener mínimo 8 caracteres";
    }

    const errPerfiles = validarPerfiles();
    if (errPerfiles) newErrors.perfiles = errPerfiles;

    const errHabilidades = validarHabilidadesBlandas();
    if (errHabilidades) newErrors.habilidades = errHabilidades;

    const errIdiomas = validarIdiomas();
    if (errIdiomas) newErrors.idiomas = errIdiomas;

    if (Object.keys(newErrors).length > 0) {

      setErrors(newErrors);

      toast.error("Revisa los campos marcados");

      return false;

    }

    setErrors({});

    return true;

  };

  // =========================================================
  // VALIDAR PERFIL (devuelven el mensaje de error o null)
  // =========================================================

  const validarPerfiles = () => {

    if (
      perfiles.length === 0 ||
      perfiles.some((p) => !p.perfil_id || !p.nivel)
    ) {
      return "Debes seleccionar al menos un perfil técnico con su nivel";
    }

    const ids = perfiles.map((p) => String(p.perfil_id));

    if (new Set(ids).size !== ids.length) {
      return "No puedes seleccionar el mismo perfil dos veces";
    }

    return null;

  };

  const validarHabilidadesBlandas = () => {

    const elegidas = habilidadesBlandas.filter(
      (h) => h.habilidad_blanda_id || h.nombre?.trim()
    );

    if (elegidas.length === 0) {
      return "Selecciona al menos una habilidad blanda";
    }

    const ids = elegidas
      .filter((h) => h.habilidad_blanda_id)
      .map((h) => String(h.habilidad_blanda_id));

    if (new Set(ids).size !== ids.length) {
      return "No puedes seleccionar habilidades blandas repetidas";
    }

    const nombres = elegidas
      .filter((h) => h.nombre?.trim())
      .map((h) => h.nombre.trim().toLocaleLowerCase("es-CO"));

    if (new Set(nombres).size !== nombres.length) {
      return "No puedes escribir habilidades blandas repetidas";
    }

    return null;

  };

  const validarIdiomas = () => {

    if (idiomas.some((i) => !i.idioma_id || !i.lee || !i.habla || !i.escucha)) {
      return "Completa todos los niveles de los idiomas";
    }

    const ids = idiomas.map((i) => String(i.idioma_id));

    if (new Set(ids).size !== ids.length) {
      return "No puedes seleccionar el mismo idioma dos veces";
    }

    const ingles = listaIdiomas.find((i) => esIngles(i.nombre));

    if (ingles && !ids.includes(String(ingles.id))) {
      return "El inglés es obligatorio";
    }

    return null;

  };

  // =========================================================
  // REGISTRAR CANDIDATO
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setBackendError("");

    if (!validarFormulario()) return;


    try {

      const data = new FormData();

      // Datos personales
      data.append("tipo_documento", form.tipo_documento);
      data.append("cedula", form.cedula);
      const nombres = [form.primer_nombre, form.segundo_nombre]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");

      const apellidos = [form.primer_apellido, form.segundo_apellido]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");

      data.append("nombres", nombres);
      data.append("apellidos", apellidos);
      data.append("telefono", form.telefono);
      data.append("password", form.password);

      // Datos de invitación
      data.append("codigo", form.codigo);
      data.append("correo", form.correo);

      // Hoja de vida
      data.append("cv", form.cv);

      // Perfiles técnicos
      data.append(
        "perfiles",
        JSON.stringify(perfiles)
      );

      // Habilidades blandas
      data.append(
        "habilidadesBlandas",
        JSON.stringify(habilidadesBlandas)
      );

      // Idiomas
      data.append(
        "idiomas",
        JSON.stringify(idiomas)
      );

      // DEBUG
      console.log("Token de la URL:", token);

      console.log("Datos enviados:");

      for (const [key, value] of data.entries()) {
        console.log(key, value);
      }

      // Registrar candidato
      await registerCandidato(
        {
          candidatoRepository
        },
        data,
        token
      );

      toast.success("Registro exitoso");

      navigate("/");

    } catch (error) {

      console.error("Error en registro:", error);

      const mensaje =
        error.response?.data?.message ||
        "Error en el registro";

      setBackendError(mensaje);

      toast.error(mensaje);

    }

  };

  // =========================================================
  // CONTROL DE ACCESO
  // =========================================================


  // =========================================================
  // PANTALLA DE CARGA
  // =========================================================

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

  // =========================================================
  // TOKEN INVÁLIDO O EXPIRADO
  // =========================================================

  if (valido === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10 w-full max-w-md text-center">

          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
              <ShieldAlert
                size={42}
                className="text-red-600"
                strokeWidth={1.7}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Invitación no disponible
          </h2>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            El enlace de invitación que intentas utilizar es inválido,
            ha expirado o ya fue utilizado. Por motivos de seguridad,
            no es posible continuar con el registro.
          </p>

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
                para completar tu registro como candidato.
              </p>
            </div>

          </div>

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

      // Perfiles técnicos
      perfiles={perfiles}
      listaPerfiles={listaPerfiles}
      addPerfil={addPerfil}
      removePerfil={removePerfil}
      handlePerfilChange={handlePerfilChange}
      nivelesPerfil={nivelesPerfil}

      // Habilidades blandas
      habilidadesBlandas={habilidadesBlandas}
      listaHabilidadesBlandas={listaHabilidadesBlandas}
      addHabilidadBlanda={addHabilidadBlanda}
      removeHabilidadBlanda={removeHabilidadBlanda}
      handleHabilidadBlandaChange={handleHabilidadBlandaChange}

      // Idiomas
      idiomas={idiomas}
      listaIdiomas={listaIdiomas}
      addIdioma={addIdioma}
      removeIdioma={removeIdioma}
      handleIdiomaChange={handleIdiomaChange}
      nivelesIdioma={nivelesIdioma}
    />

  );

}