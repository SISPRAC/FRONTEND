import { createApi } from "./createApi.js";

const perfilApi  = createApi("/perfil");


export const getPerfilesRequest = () => perfilApi.get("/all");

export const createPerfilRequest = async (data) => {
  return await perfilApi.post("/crear", data);
};
