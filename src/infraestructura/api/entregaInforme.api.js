import axios from "axios";


const entregaInformeApi = axios.create({

    baseURL: "http://localhost:3000/api/entregaInforme",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
entregaInformeApi.interceptors.request.use(

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


// Obtener una entrega por ID
export const getEntregaInformeByIdRequest = async (id) => {

    return await entregaInformeApi.get(`/${id}`);

};


// Obtener entregas de un informe de práctica
export const getEntregasInformeByPracticaInformeRequest = async (
    practica_informe_id
) => {

    return await entregaInformeApi.get(
        `/practica-informe/${practica_informe_id}`
    );

};


// Obtener entregas de un practicante
export const getEntregasInformeByPracticaPracticanteRequest = async (
    practica_practicante_id
) => {

    return await entregaInformeApi.get(
        `/practica-practicante/${practica_practicante_id}`
    );

};


// Obtener entregas de un practicante para un informe específico
export const getEntregasInformeByPracticaPracticanteAndInformeRequest = async (
    practica_practicante_id,
    practica_informe_id
) => {

    return await entregaInformeApi.get(
        `/practica-practicante/${practica_practicante_id}/informe/${practica_informe_id}`
    );

};


// Crear entrega de informe
export const createEntregaInformeRequest = async (data) => {

    return await entregaInformeApi.post(
        "/crear",
        data
    );

};


// Revisar entrega como tutor docente
export const reviewEntregaInformeTutorDocenteRequest = async (
    id,
    data
) => {

    return await entregaInformeApi.put(
        `/${id}/revision/tutor-docente`,
        data
    );

};


// Revisar entrega como tutor empresarial
export const reviewEntregaInformeTutorEmpresarialRequest = async (
    id,
    data
) => {

    return await entregaInformeApi.put(
        `/${id}/revision/tutor-empresarial`,
        data
    );

};