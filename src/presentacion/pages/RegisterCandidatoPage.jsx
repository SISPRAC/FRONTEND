import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CandidateForm from "../components/CandidatoForm";
import { registerCandidato } from "../../aplicacion/candidato/registerCandidato";
import { candidatoRepository } from "../../infraestructura/repository/candidatoRepository.js";
import { perfilRepository } from "../../infraestructura/repository/perfilRepository.js";
import { getPerfiles } from "../../aplicacion/perfil/getPerfiles";
import toast from "react-hot-toast";
export default function RegisterCandidatePage() {
  const navigate = useNavigate();
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

  const addPerfil = () => {
    if (perfiles.length >= 2) return;

    setPerfiles([
      ...perfiles,
      {
        perfil_id: "",
        calificacion: ""
      }
    ]);
  };

  const removePerfil = (index) => {
    setPerfiles(perfiles.filter((_, i) => i !== index));
  };

  const handlePerfilChange = (index, field, value) => {
    const updated = [...perfiles];

    updated[index][field] = value;

    setPerfiles(updated);
  };

 useEffect(() => {
  const loadPerfiles = async () => {
    try {
      const perfiles = await getPerfiles({
        perfilRepository
      });
      setListaPerfiles(perfiles);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar perfiles");
    }
  };

  loadPerfiles();
}, []);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // 🔒 SOLO NÚMEROS
    if (name === "codigo" || name === "cedula" || name === "telefono") {
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
    setForm({ ...form, cv: file });
    if (errors.cv) {
      setErrors({ ...errors, cv: undefined });
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validar campos principales
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

    // 2. Validar perfiles completos
    const perfilInvalido = perfiles.some(
      (p) => !p.perfil_id || !p.calificacion
    );

    if (perfilInvalido) {
      toast.error("Debe seleccionar un perfil y una calificación");
      return;
    }

    // 3. Validar perfiles duplicados
    const ids = perfiles
      .map((p) => p.perfil_id)
      .filter(Boolean);

    if (new Set(ids).size !== ids.length) {
      toast.error("No puede seleccionar el mismo perfil dos veces");
      return;
    }

    try {
      const data = new FormData();

      Object.keys(form).forEach((key) => {
        data.append(key, form[key]);
      });

      data.append(
        "perfiles",
        JSON.stringify(perfiles)
      );

          await registerCandidato(
      { candidatoRepository },
      data
    );

      toast.success("Registro exitoso");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error en el registro"
      );
    }
  };

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