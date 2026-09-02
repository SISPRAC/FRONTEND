import {
    registerPostulacionRequest,
    eliminarPostulacionRequest,
    getCandidatosEmpresaRequest,
    aceptarPostulacionRequest,
    rechazarPostulacionRequest
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
    },

    async getCandidatosEmpresa() {
        const response =
            await getCandidatosEmpresaRequest();

        return response.data;
    },

    async aceptarPostulacion(postulacionId) {
        const response =
            await aceptarPostulacionRequest(
                postulacionId
            );

        return response.data;
    },

    async rechazarPostulacion(
        postulacionId,
        comentarioEmpresa = null
    ) {
        const response =
            await rechazarPostulacionRequest(
                postulacionId,
                comentarioEmpresa
            );

        return response.data;
    }

};