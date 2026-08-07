import axios from "axios";

const practicaRequisitoDocumentoApi = axios.create({
    baseURL: "http://localhost:3000/api/practicaRequisitoDocumento",
    withCredentials: true,
});

export const createPracticaRequisitoDocumentoRequest = async (data) => {
    return await practicaRequisitoDocumentoApi.post("/", data);
};

export const updatePracticaRequisitoDocumentoRequest = async (id, data) => {
    return await practicaRequisitoDocumentoApi.put(`/${id}`, data);
};

export const deletePracticaRequisitoDocumentoRequest = async (id) => {
    return await practicaRequisitoDocumentoApi.delete(`/${id}`);
};

export const getPracticaRequisitoDocumentoRequest = async (id) => {
    return await practicaRequisitoDocumentoApi.get(`/detalle/${id}`);
};

export const getPracticaRequisitosDocumentoByPracticaRequest = async (practica_id) => {
    return await practicaRequisitoDocumentoApi.get(
        `/practica/${practica_id}`
    );
};

export const getPracticaRequisitosDocumentoByRolRequest = async (
    practica_id,
    rol_id
) => {
    return await practicaRequisitoDocumentoApi.get(
        `/practica/${practica_id}/rol/${rol_id}`
    );
};