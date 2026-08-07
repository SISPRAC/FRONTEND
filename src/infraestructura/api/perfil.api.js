import axios from "axios";

const perfilApi = axios.create({
  baseURL: "http://localhost:3000/api/perfil",
  withCredentials: true
});

export const getPerfilesRequest = () => perfilApi.get("/all");

export const createPerfilRequest = async (data) => {
  return await perfilApi.post("/crear", data);
};
