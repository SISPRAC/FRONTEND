import axios from "axios";

const practicaApi = axios.create({
  baseURL: "http://localhost:3000/api/practica",
  withCredentials: true
});

export const getPracticasRequest = async () => {
  return await practicaApi.get("/all");
};

export const getPracticaByIdRequest = async (id) => {
  return await practicaApi.get(`/${id}`);
};

export const getPracticaByPeriodoRequest = async (periodo_id) => {
  return await practicaApi.get(`/periodo/${periodo_id}`);
};

export const createPracticaRequest = async (data) => {
  return await practicaApi.post("/crear", data);
};

export const updatePracticaRequest = async (id, data) => {
  return await practicaApi.put(`/${id}`, data);
};

export const deletePracticaRequest = async (id) => {
  return await practicaApi.delete(`/${id}`);
};