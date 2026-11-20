import { createApi } from "./createApi.js";

const visitaApi = createApi("/visita");

visitaApi.interceptors.request.use(
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


// Obtener visita por su propio ID
export const obtenerVisitaRequest = (id) => {
    return visitaApi.get(`/${id}`);
};


// Obtener visita mediante el ID de SolicitudVisita
export const obtenerVisitaPorSolicitudRequest = (solicitudVisitaId) => {
    return visitaApi.get(`/solicitud/${solicitudVisitaId}`);
};


// Obtener visitas mediante el ID del practicante
export const obtenerVisitasPorPracticanteRequest = (practicanteId) => {
    return visitaApi.get(`/practicante/${practicanteId}`);
};


// Actualizar / completar visita
export const actualizarVisitaRequest = (id, data) => {
    return visitaApi.put(
        `/${id}`,
        data,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );
};
