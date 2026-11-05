import axios from "axios";

const notificacionApi = axios.create({
  baseURL: "http://localhost:3000/api/notificaciones",
  withCredentials: true
});


const getToken = () => {
  return localStorage.getItem("token");
};


// OBTENER TODAS
export const getNotificacionesRequest = async () => {

  const token = getToken();

  return await notificacionApi.get(
    "/",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// OBTENER NO LEÍDAS
export const getNotificacionesNoLeidasRequest = async () => {

  const token = getToken();

  return await notificacionApi.get(
    "/no-leidas",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// MARCAR UNA COMO LEÍDA
export const marcarNotificacionLeidaRequest = async (id) => {

  const token = getToken();

  return await notificacionApi.put(
    `/${id}/leida`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};


// MARCAR TODAS COMO LEÍDAS
export const marcarTodasNotificacionesLeidasRequest = async () => {

  const token = getToken();

  return await notificacionApi.put(
    "/marcar-todas-leidas",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};