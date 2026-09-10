import axios from "axios";

const practicaApi = axios.create({
    baseURL: "http://localhost:3000/api/practica",
    withCredentials: true
});


// Agregar token automáticamente a cada petición
practicaApi.interceptors.request.use(

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


export const getPracticasRequest = async () => {
    return await practicaApi.get("/all");
};


export const getPracticaByIdRequest = async (id) => {
    return await practicaApi.get(`/${id}`);
};


export const getPracticaByPeriodoRequest = async (periodo_id) => {
    return await practicaApi.get(`/periodo/${periodo_id}`);
};


export const createPracticaRequest = async (data) => {
    return await practicaApi.post("/crear", data);
};


export const updatePracticaRequest = async (id, data) => {
    return await practicaApi.put(`/${id}`, data);
};


export const deletePracticaRequest = async (id) => {
    return await practicaApi.delete(`/${id}`);
};


// Subir / actualizar ARL de una práctica
export const actualizarArlPracticaRequest = async (id, archivo) => {

    const formData = new FormData();

    formData.append("archivo", archivo);

    return await practicaApi.put(
        `/${id}/arl`,
        formData
    );
};