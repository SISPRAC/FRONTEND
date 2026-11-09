import axios from "axios";

const idiomaApi = axios.create({
    baseURL: "http://localhost:3000/api/idiomas",
    withCredentials: true
});

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