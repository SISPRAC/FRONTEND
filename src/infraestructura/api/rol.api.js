import { createApi } from "./createApi.js";

const rolApi = createApi("/rol");

export const crearRolRequest = async (data) => {
  return await rolApi.post("/crear", data);
};

export const getRolesRequest = async () => {
  return await rolApi.get("/roles");
};