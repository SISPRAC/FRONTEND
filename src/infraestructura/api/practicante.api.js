import axios from "axios";

const practicanteApi = axios.create({
  baseURL: "http://localhost:3000/api/practicante",
  withCredentials: true
});

// Agregar token automáticamente a cada petición
practicanteApi.interceptors.request.use(
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

export const getPracticantes = () => {
  return practicanteApi.get("/all");
};

export const obtenerMiPractica = () => {
  return practicanteApi.get("/mi-practica");
};

export const obtenerPracticantesPorPractica = (practicaId) => {
  return practicanteApi.get(`/practica/${practicaId}`);
};

export const obtenerPracticantePorId = (id) => {
  return practicanteApi.get(`/${id}`);
};

export const obtenerRequisitosDocumentosPracticante = (practicanteId) => {
  return practicanteApi.get(
    `/requisitos-documentos/${practicanteId}`
  );
};