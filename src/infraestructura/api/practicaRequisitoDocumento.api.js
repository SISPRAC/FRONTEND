import axios from "axios";


const practicaRequisitoDocumentoApi = axios.create({

    baseURL: "http://localhost:3000/api/practicaRequisitoDocumento",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
practicaRequisitoDocumentoApi.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");


        if(token){

            config.headers.Authorization =
            `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


// Obtener requisitos documentales de una práctica
export const getPracticaRequisitosDocumentoRequest = async (
    practica_id
) => {

    return await practicaRequisitoDocumentoApi.get(
        `/practica/${practica_id}`
    );

};


// Obtener requisitos documentales de una práctica por rol
export const getPracticaRequisitosDocumentoByRolRequest = async (
    practica_id,
    rol_id
) => {

    return await practicaRequisitoDocumentoApi.get(
        `/practica/${practica_id}/rol/${rol_id}`
    );

};


// Crear requisito documental para una práctica
export const createPracticaRequisitoDocumentoRequest = async (
    data
) => {

    return await practicaRequisitoDocumentoApi.post(
        "/crear",
        data
    );

};


// Eliminar requisito documental
export const deletePracticaRequisitoDocumentoRequest = async (
    id
) => {

    return await practicaRequisitoDocumentoApi.delete(
        `/${id}`
    );

};


// Obtener requisito documental por ID
export const getPracticaRequisitoDocumentoByIdRequest = async (
    id
) => {

    return await practicaRequisitoDocumentoApi.get(
        `/${id}`
    );

};


// Actualizar requisito documental
export const updatePracticaRequisitoDocumentoRequest = async (
    id,
    data
) => {

    return await practicaRequisitoDocumentoApi.put(
        `/${id}`,
        data
    );

};