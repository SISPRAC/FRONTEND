import { createApi } from "./createApi.js";

const historialConvenioApi =  createApi("/historialConvenio");

export const registrarHistrialConvenioRequest = async (data) => {
  return await historialConvenioApi.post("/registrar", data);
};

 
