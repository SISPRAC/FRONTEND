import axios from "axios";

const practicaRequisitoDocumentoApi = axios.create({

    baseURL: "http://localhost:3000/api/practicaRequisitoDocumento",

    withCredentials: true

});

// Agregar token automáticamente a cada petición
practicaRequisitoDocumentoApi.interceptors.request.use(

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

// ============================================================
// OBTENER REQUISITOS DOCUMENTALES DE UNA PRÁCTICA
// ============================================================

export const getPracticaRequisitosDocumentoRequest = async (
    practica_id
) => {

    return await practicaRequisitoDocumentoApi.get(
        `/practica/${practica_id}`
    );

};

// ============================================================
// OBTENER REQUISITOS DOCUMENTALES DE UNA PRÁCTICA POR ROL
// ============================================================

export const getPracticaRequisitosDocumentoByRolRequest = async (
    practica_id,
    rol_id
) => {

    return await practicaRequisitoDocumentoApi.get(
        `/practica/${practica_id}/rol/${rol_id}`
    );

};

// ============================================================
// OBTENER REQUISITOS VIGENTES DEL PRACTICANTE
// ============================================================

export const getRequisitosPracticanteVigentesRequest = async () => {

    return await practicaRequisitoDocumentoApi.get(
        "/practicante/vigentes"
    );

};

// ============================================================
// OBTENER INFORMES VIGENTES DEL PRACTICANTE
// ============================================================

export const getInformesPracticanteVigentesRequest = async () => {

    return await practicaRequisitoDocumentoApi.get(
        "/practicante/informes/vigentes"
    );

};

// ============================================================
// OBTENER REQUISITOS VIGENTES DE LA EMPRESA
// ============================================================

export const getRequisitosEmpresaVigentesRequest = async () => {

    return await practicaRequisitoDocumentoApi.get(
        "/empresa/vigentes"
    );

};

// ============================================================
// CREAR REQUISITO DOCUMENTAL PARA UNA PRÁCTICA
// ============================================================

export const createPracticaRequisitoDocumentoRequest = async (
    data
) => {

    return await practicaRequisitoDocumentoApi.post(
        "/crear",
        data
    );

};

// ============================================================
// ELIMINAR REQUISITO DOCUMENTAL
// ============================================================

export const deletePracticaRequisitoDocumentoRequest = async (
    id
) => {

    return await practicaRequisitoDocumentoApi.delete(
        `/${id}`
    );

};

// ============================================================
// OBTENER REQUISITO DOCUMENTAL POR ID
// ============================================================

export const getPracticaRequisitoDocumentoByIdRequest = async (
    id
) => {

    return await practicaRequisitoDocumentoApi.get(
        `/${id}`
    );

};

// ============================================================
// ACTUALIZAR REQUISITO DOCUMENTAL
// ============================================================

export const updatePracticaRequisitoDocumentoRequest = async (
    id,
    data
) => {

    return await practicaRequisitoDocumentoApi.put(
        `/${id}`,
        data
    );

};