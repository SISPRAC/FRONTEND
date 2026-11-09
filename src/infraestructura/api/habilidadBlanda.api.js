import axios from "axios";

const habilidadBlandaApi = axios.create({
    baseURL: "http://localhost:3000/api/habilidadesBlandas",
    withCredentials: true
});

// Agregar token automáticamente a cada petición
habilidadBlandaApi.interceptors.request.use(

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

export const getHabilidadesBlandasRequest = () => {
    return habilidadBlandaApi.get("/all");
};