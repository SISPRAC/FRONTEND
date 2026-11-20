import { createApi } from "./createApi.js";

const idiomaApi =  createApi("/idiomas");

// Agregar token automáticamente a cada petición
idiomaApi.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

export const getIdiomasRequest = () => {
    return idiomaApi.get("/all");
};