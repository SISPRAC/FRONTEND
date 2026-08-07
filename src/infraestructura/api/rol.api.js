import axios from "axios";

const rolApi = axios.create({
  baseURL: "http://localhost:3000/api/rol",
  withCredentials: true,
});

export const crearRolRequest = async (data) => {
  return await rolApi.post("/crear", data);
};

export const getRolesRequest = async () => {
  return await rolApi.get("/roles");
};