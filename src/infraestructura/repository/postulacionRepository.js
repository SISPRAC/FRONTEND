import {
    registerPostulacionRequest,
    eliminarPostulacionRequest
} from "../api/postulacion.api.js";

export const postulacionRepository = {

    async register(data) {
        const response =
            await registerPostulacionRequest(data);

        return response.data;
    },

    async eliminarPostulacionR(
        aperturaVacanteId,
        candidatoId
    ) {
        const response =
            await eliminarPostulacionRequest(
                aperturaVacanteId,
                candidatoId
            );

        return response.data;
    }

};