import {
    actualizarVisitaRequest,
    obtenerVisitaRequest,
    obtenerVisitaPorSolicitudRequest,
    obtenerVisitasPorPracticanteRequest
} from "../api/visita.api.js";

export const visitaRepository = {
    async actualizarVisita(id, data) {
        const response = await actualizarVisitaRequest(id, data);
        return response.data;
    },

    async obtenerVisita(id) {
        const response = await obtenerVisitaRequest(id);
        return response.data;
    },

    async obtenerVisitaPorSolicitud(solicitudVisitaId) {
        const response = await obtenerVisitaPorSolicitudRequest(
            solicitudVisitaId
        );

        return response.data;
    },

    async obtenerVisitasPorPracticante(practicanteId) {
        const response = await obtenerVisitasPorPracticanteRequest(
            practicanteId
        );

        return response.data;
    }
};
