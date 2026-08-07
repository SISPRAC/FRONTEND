import axios from "axios";

const candidatoApi = axios.create({
  baseURL: "http://localhost:3000/api/candidato",
  withCredentials: true
});

export const registerCandidatoRequest = (data) => {
  return candidatoApi.post("/registrarCandidato", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    }
  });
};

export const getCandidatos = () => {
  return candidatoApi.get("/all");
};

export const getCandidatosDisponibles = () => {
  return candidatoApi.get("/disponibles");
};

export const getCandidatosPerfil = (perfilNombre) =>{
  return candidatoApi.get(`/perfil/${perfilNombre}`);
};