import axios from "axios";


const entregaInformeApi = axios.create({

    baseURL: "http://localhost:3000/api/entregaInforme",

    withCredentials: true

});


// =========================================================
// TOKEN DE AUTENTICACIÓN NORMAL
// =========================================================

entregaInformeApi.interceptors.request.use(

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



// =========================================================
// OBTENER ENTREGAS DE UN PRACTICANTE POR TIPO DE DOCUMENTO
// =========================================================

export const getEntregaInformeByPracticanteRequest = async (
    practicante_id,
    tipo_requisito_documento_id
) => {

    return await entregaInformeApi.get(
        `/practicante/${practicante_id}/tipo/${tipo_requisito_documento_id}`
    );

};


// =========================================================
// OBTENER TRAZABILIDAD DE UN INFORME
// =========================================================

export const getTrazabilidadEntregaInformeRequest = async (
    practicante_id,
    tipo_requisito_documento_id
) => {

    return await entregaInformeApi.get(
        `/trazabilidad/practicante/${practicante_id}/tipo/${tipo_requisito_documento_id}`
    );

};


// =========================================================
// CREAR ENTREGA DE INFORME
// =========================================================

export const createEntregaInformeRequest = async (data) => {

    return await entregaInformeApi.post(
        "/crear",
        data
    );

};


// =========================================================
// REVISAR ENTREGA COMO TUTOR DOCENTE
// =========================================================

export const reviewEntregaInformeTutorDocenteRequest = async (
    id,
    data
) => {

    return await entregaInformeApi.put(
        `/${id}/revision/tutor-docente`,
        data
    );

};


// =========================================================
// REVISAR ENTREGA COMO TUTOR EMPRESARIAL
// =========================================================

export const reviewEntregaInformeTutorEmpresarialRequest = async (
    id,
    data
) => {

    return await entregaInformeApi.put(
        `/${id}/revision/tutor-empresarial`,
        data
    );

};