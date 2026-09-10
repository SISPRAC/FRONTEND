import {
    getPracticaInformesRequest,
    createPracticaInformeRequest,
    deletePracticaInformeRequest,
    getPracticaInformeByIdRequest,
    updatePracticaInformeRequest
} from "../api/practicaInforme.api.js";


export const practicaInformeRepository = {

    async findByPracticaId(practica_id) {

        const response =
            await getPracticaInformesRequest(
                practica_id
            );

        return response.data;

    },


    async create(data) {

        const response =
            await createPracticaInformeRequest(
                data
            );

        return response.data;

    },


    async delete(id) {

        const response =
            await deletePracticaInformeRequest(
                id
            );

        return response.data;

    },


    async findById(id) {

        const response =
            await getPracticaInformeByIdRequest(
                id
            );

        return response.data;

    },


    async update(id, data) {

        const response =
            await updatePracticaInformeRequest(
                id,
                data
            );

        return response.data;

    }

};