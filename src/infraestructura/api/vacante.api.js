import axios from "axios";

const vacanteApi = axios.create({
  baseURL: "http://localhost:3000/api/vacante",
  withCredentials: true
});


const getToken = () => {
  return localStorage.getItem("token");
};


/* ============================================================
   OBTENER APERTURAS DE VACANTES
============================================================ */

export const getAperturasVacantesRequest = async () => {

  const token = getToken();

  return await vacanteApi.get("/all", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};


/* ============================================================
   OBTENER VACANTES DE LA EMPRESA
============================================================ */

export const getVacantesByEmpresaRequest = async () => {

  const token = getToken();

  return await vacanteApi.get("/empresa", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};


/* ============================================================
   OBTENER VACANTE POR ID
============================================================ */

export const getVacanteByIdRequest = async (id) => {

  const token = getToken();

  return await vacanteApi.get(`/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

};


/* ============================================================
   CREAR VACANTE
============================================================ */

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


/* ============================================================
   ACTUALIZAR VACANTE
============================================================ */

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


/* ============================================================
   ELIMINAR / CERRAR VACANTE
============================================================ */

export const eliminarVacanteRequest = async (id) => {

  const token = getToken();

  return await vacanteApi.delete(
    `/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

};