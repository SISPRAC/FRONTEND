import axios from "axios";


const practicaInformeApi = axios.create({

    baseURL: "http://localhost:3000/api/practicaInforme",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
practicaInformeApi.interceptors.request.use(

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


// Obtener informes de una práctica
export const getPracticaInformesRequest = async (
    practica_id
) => {

    return await practicaInformeApi.get(
        `/practica/${practica_id}`
    );

};


// Crear informe para una práctica
export const createPracticaInformeRequest = async (
    data
) => {

    return await practicaInformeApi.post(
        "/crear",
        data
    );

};


// Eliminar informe de una práctica
export const deletePracticaInformeRequest = async (
    id
) => {

    return await practicaInformeApi.delete(
        `/${id}`
    );

};


// Obtener informe por ID
export const getPracticaInformeByIdRequest = async (
    id
) => {

    return await practicaInformeApi.get(
        `/${id}`
    );

};


// Actualizar informe de una práctica
export const updatePracticaInformeRequest = async (
    id,
    data
) => {

    return await practicaInformeApi.put(
        `/${id}`,
        data
    );

};