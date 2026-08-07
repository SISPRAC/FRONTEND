import axios from "axios";

const grupoApi = axios.create({
  baseURL: "http://localhost:3000/api/grupo",
  withCredentials: true
});

export const getGruposRequest = () => grupoApi.get("/all");

export const createGrupoRequest = async (data) => {
  return await grupoApi.post("/crear", data);
};

export const getCandidatosGrupoRequest = (grupoId) => {
  return grupoApi.get(`/${grupoId}/candidatos`);
};

export const getGrupoRequest = (id) => {
  return grupoApi.get(`/${id}`);
};

export const editarGrupoRequest = (id, data) => {
  return grupoApi.put(`/${id}`, data);
};

export const deleteGrupoRequest = (id) => {
  return grupoApi.delete(`/${id}`);
};
