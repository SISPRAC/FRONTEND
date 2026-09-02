import axios from "axios";

const aperturaVacanteApi = axios.create({
  baseURL: "http://localhost:3000/api/aperturaVacante",
  withCredentials: true
});


const getToken = () => {
  return localStorage.getItem("token");
};


// CREAR APERTURA
export const crearAperturaVacanteRequest = async (data) => {

  const token = getToken();

  return await aperturaVacanteApi.post(
    "/crear",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// ACTUALIZAR APERTURA
export const actualizarAperturaVacanteRequest = async (
  id,
  data
) => {

  const token = getToken();

  return await aperturaVacanteApi.put(
    `/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// OBTENER TODAS
export const getAperturasVacantesRequest = async () => {

  const token = getToken();

  return await aperturaVacanteApi.get(
    "/all",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// OBTENER UNA
export const getAperturaVacanteByIdRequest = async (id) => {

  const token = getToken();

  return await aperturaVacanteApi.get(
    `/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// ELIMINAR
export const eliminarAperturaVacanteRequest = async (id) => {

  const token = getToken();

  return await aperturaVacanteApi.delete(
    `/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};