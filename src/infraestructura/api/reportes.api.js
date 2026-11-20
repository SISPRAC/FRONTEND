import { createApi } from "./createApi.js";

const reporteApi = createApi("/reportes");

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


// Obtener los datos del dashboard de un período.
// empresaId es opcional: si no viene, el backend devuelve la vista global.
export const obtenerDashboardReporteRequest = (periodoId, empresaId) => {
    return reporteApi.get("/dashboard", {
        params: {
            periodoId,
            ...(empresaId ? { empresaId } : {}),
        },
    });
};