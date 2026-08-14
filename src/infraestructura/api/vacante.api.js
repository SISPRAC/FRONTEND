import axios from "axios";

const vacanteApi = axios.create({
  baseURL: "http://localhost:3000/api/vacante",
  withCredentials: true
});


const getToken = () => {
  return localStorage.getItem("token");
};


export const getAperturasVacantesRequest = async () => {

  const token = getToken();

  return await vacanteApi.get("/all", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};


export const getVacantesByEmpresaRequest = async () => {

  const token = getToken();

  return await vacanteApi.get("/empresa", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};


export const getVacanteByIdRequest = async (id) => {

  const token = getToken();

  return await vacanteApi.get(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};


export const crearVacanteRequest = async (data) => {

  const token = getToken();

  return await vacanteApi.post(
    "/crear",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

};


export const actualizarVacanteRequest = async (
  id,
  data
) => {

  const token = getToken();

  return await vacanteApi.put(
    `/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

};