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

