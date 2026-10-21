
import axios from "axios";

const grupoApi = axios.create({

    baseURL: "http://localhost:3000/api/grupo",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
grupoApi.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// OBTENER TODOS LOS GRUPOS
export const getGruposRequest = () => grupoApi.get("/all");


// OBTENER GRUPOS POR ID DE PRÁCTICA
export const getGruposByPracticaIdRequest = async (practica_id) => {
    return await grupoApi.get(`/practica/${practica_id}`);
};


// CREAR GRUPO
export const createGrupoRequest = async (data) => {
    return await grupoApi.post("/crear", data);
};


// OBTENER CANDIDATOS DEL GRUPO
export const getCandidatosGrupoRequest = async (grupoId) => {
    return await grupoApi.get(`/${grupoId}/candidatos`);
};


// OBTENER DOCUMENTOS DE PRACTICANTES POR GRUPO
export const getPracticantesDocumentosByGrupoRequest = async (grupoId) => {
    return await grupoApi.get(`/${grupoId}/documentos-practicantes`);
};


// OBTENER UN GRUPO
export const getGrupoRequest = async (id) => {
    return await grupoApi.get(`/${id}`);
};


// EDITAR GRUPO
export const editarGrupoRequest = async (id, data) => {
    return await grupoApi.put(`/${id}`, data);
};


// ELIMINAR GRUPO
export const deleteGrupoRequest = async (id) => {
    return await grupoApi.delete(`/${id}`);
};
