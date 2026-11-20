import { createApi } from "./createApi.js";

const tutorEmpresarialApi  = createApi("/tutorEmpresarial");

tutorEmpresarialApi.interceptors.request.use(
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

export const getTutorEmpresariales = () => {
  return tutorEmpresarialApi.get("/all");
};

export const invitarTutorEmpresarialRequest = (correo) => {
  return tutorEmpresarialApi.post("/invitacion", {
    correo
  });
};

export const getAperturasByTutorEmpresa = (periodoId, practicaId) => {
  return tutorEmpresarialApi.get("/mis-aperturas", {
    params: {
      periodoId,
      practicaId
    }
  });
};

export const getAperturasByPractica = (practicaId) => {
  return tutorEmpresarialApi.get(
    `/mis-aperturas/${practicaId}`
  );
};