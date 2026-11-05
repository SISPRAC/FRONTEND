import {
    getTutorEmpresariales,
    invitarTutorEmpresarialRequest,
    getAperturasByTutorEmpresa,
    getAperturasByPractica
} from "../api/tutorEmpresarial.api";


export const tutorEmpresarialRepository = {

    async getAll() {

        const { data } = await getTutorEmpresariales();

        return data;

    },

    async invitar(correo) {

        const { data } = await invitarTutorEmpresarialRequest(correo);

        return data;

    },

    async getAperturasByTutorEmpresa(periodoId, practicaId) {

        const { data } = await getAperturasByTutorEmpresa(
            periodoId,
            practicaId
        );

        return data;

    },

    async getAperturasByPractica(practicaId) {

        const { data } = await getAperturasByPractica(
            practicaId
        );

        return data;

    }

};