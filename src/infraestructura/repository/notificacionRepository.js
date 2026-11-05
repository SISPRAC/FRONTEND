import {
    getNotificacionesRequest,
    getNotificacionesNoLeidasRequest,
    marcarNotificacionLeidaRequest,
    marcarTodasNotificacionesLeidasRequest
} from "../api/notificacion.api.js";

export const notificacionRepository = {

    // =============================
    // OBTENER TODAS
    // =============================

    async getAll() {

        const response =
            await getNotificacionesRequest();

        return response.data;

    },


    // =============================
    // OBTENER NO LEÍDAS
    // =============================

    async getNoLeidas() {

        const response =
            await getNotificacionesNoLeidasRequest();

        return response.data;

    },


    // =============================
    // MARCAR UNA COMO LEÍDA
    // =============================

    async marcarComoLeida(id) {

        const response =
            await marcarNotificacionLeidaRequest(
                id
            );

        return response.data;

    },


    // =============================
    // MARCAR TODAS COMO LEÍDAS
    // =============================

    async marcarTodasComoLeidas() {

        const response =
            await marcarTodasNotificacionesLeidasRequest();

        return response.data;

    }

};