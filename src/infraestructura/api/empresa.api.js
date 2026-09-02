import axios from "axios";

const empresaApi = axios.create({
    baseURL: "http://localhost:3000/api/empresa",
    withCredentials: true
});


// =========================================================
// TOKEN DE AUTENTICACIÓN NORMAL
// =========================================================

empresaApi.interceptors.request.use(

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
// REGISTRAR EMPRESA
// =========================================================

export const registerEmpresaRequest = (data, token) => {

    return empresaApi.post(
        `/registrarEmpresa?token=${encodeURIComponent(token)}`,
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

};


// =========================================================
// INVITAR EMPRESA
// =========================================================

export const invitarEmpresaRequest = (data) => {

    return empresaApi.post(
        "/invitacion",
        data
    );

};


// =========================================================
// OBTENER EMPRESA DEL USUARIO AUTENTICADO
// =========================================================

export const getMiEmpresaRequest = () => {

    return empresaApi.get(
        "/mi-empresa"
    );

};


// =========================================================
// OBTENER GRUPOS DE LA EMPRESA AUTENTICADA
// =========================================================

export const getMisGruposRequest = () => {

    return empresaApi.get(
        "/mis-grupos"
    );

};


// =========================================================
// OBTENER DETALLE DE UN GRUPO
// =========================================================

export const getDetalleGrupoEmpresaRequest = (
    practicaId
) => {

    return empresaApi.get(
        `/mis-grupos/${practicaId}`
    );

};


// =========================================================
// ACTUALIZAR EMPRESA
// =========================================================

export const actualizarEmpresaRequest = (
    id,
    data
) => {

    return empresaApi.put(
        `/${id}`,
        data
    );

};