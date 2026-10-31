import axios from "axios";

const reporteApi = axios.create({
    baseURL: "http://localhost:3000/api/reportes",
    withCredentials: true
});

reporteApi.interceptors.request.use(
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


// Obtener los datos del dashboard de un período
export const obtenerDashboardReporteRequest = (periodoId) => {
    return reporteApi.get("/dashboard", {
        params: { periodoId }
    });
};