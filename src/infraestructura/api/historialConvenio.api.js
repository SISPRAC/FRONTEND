import axios from "axios";

const historialConvenioApi = axios.create({
  baseURL: "http://localhost:3000/api/historialConvenio",
  withCredentials: true
});

export const registrarHistrialConvenioRequest = async (data) => {
  return await historialConvenioApi.post("/registrar", data);
};

 
