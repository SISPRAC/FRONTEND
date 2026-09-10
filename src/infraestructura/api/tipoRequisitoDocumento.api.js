import axios from "axios";


const tipoRequisitoDocumentoApi = axios.create({

    baseURL: "http://localhost:3000/api/tipoRequisitoDocumento",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
tipoRequisitoDocumentoApi.interceptors.request.use(

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


// Obtener todos los tipos de requisitos documentales
export const getTiposRequisitoDocumentoRequest = async () => {

    return await tipoRequisitoDocumentoApi.get(
        "/all"
    );

};


// Obtener tipos de requisitos documentales por rol
export const getTiposRequisitoDocumentoByRolRequest = async (
    rol_id
) => {

    return await tipoRequisitoDocumentoApi.get(
        `/rol/${rol_id}`
    );

};


// Crear tipo de requisito documental
export const createTipoRequisitoDocumentoRequest = async (
    data
) => {

    return await tipoRequisitoDocumentoApi.post(
        "/crear",
        data
    );

};


// Eliminar tipo de requisito documental
export const deleteTipoRequisitoDocumentoRequest = async (
    id
) => {

    return await tipoRequisitoDocumentoApi.delete(
        `/${id}`
    );

};


// Obtener tipo de requisito documental por ID
export const getTipoRequisitoDocumentoByIdRequest = async (
    id
) => {

    return await tipoRequisitoDocumentoApi.get(
        `/${id}`
    );

};


// Actualizar tipo de requisito documental
export const updateTipoRequisitoDocumentoRequest = async (
    id,
    data
) => {

    return await tipoRequisitoDocumentoApi.put(
        `/${id}`,
        data
    );

};