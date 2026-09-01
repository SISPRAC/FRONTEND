import axios from "axios";

const candidatoApi = axios.create({
  baseURL: "http://localhost:3000/api/candidato",
  withCredentials: true
});

candidatoApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Registrar candidato
export const registerCandidatoRequest = (data, token) => {

  return candidatoApi.post(
    "/registrarCandidato",
    data,
    {
      params: {
        token
      },
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

};

// Actualizar candidato
export const updateCandidatoRequest = (id, data) => {
  return candidatoApi.put(`/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// Obtener todos los candidatos
export const getCandidatos = () => {
  return candidatoApi.get("/all");
};

// Obtener candidatos disponibles
export const getCandidatosDisponibles = () => {
  return candidatoApi.get("/disponibles");
};

// Obtener candidatos por perfil
export const getCandidatosPerfil = (perfilNombre) => {
  return candidatoApi.get(`/perfil/${perfilNombre}`);
};

// Invitar candidato
export const invitarCandidatoRequest = (data) => {
  return candidatoApi.post("/invitacion", data);
};