import axios from "axios";

const postulacionApi = axios.create({
  baseURL: "http://localhost:3000/api/postulacion",
  withCredentials: true
});

export const registerPostulacionRequest = async (data) => {
  return await postulacionApi.post("/crear", data);
};

export const eliminarPostulacionRequest = async (
  aperturaVacanteId,
  candidatoId
) => {
  return await postulacionApi.delete(
    `/apertura/${aperturaVacanteId}/candidato/${candidatoId}`
  );
};

export const getCandidatosEmpresaRequest = async () => {

  const token = localStorage.getItem("token");

  return await postulacionApi.get("/empresa/candidatos", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const aceptarPostulacionRequest = async (postulacionId) => {

  const token = localStorage.getItem("token");

  return await postulacionApi.patch(
    `/${postulacionId}/aceptar`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};

export const rechazarPostulacionRequest = async (
  postulacionId,
  comentarioEmpresa = null
) => {

  const token = localStorage.getItem("token");

  return await postulacionApi.patch(
    `/${postulacionId}/rechazar`,
    {
      comentarioEmpresa
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
};