import {
    getPracticaRequisitosDocumentoRequest,
    getPracticaRequisitosDocumentoByRolRequest,
    createPracticaRequisitoDocumentoRequest,
    deletePracticaRequisitoDocumentoRequest,
    getPracticaRequisitoDocumentoByIdRequest,
    updatePracticaRequisitoDocumentoRequest
} from "../api/practicaRequisitoDocumento.api.js";


export const practicaRequisitoDocumentoRepository = {

    async findByPracticaId(practica_id) {

        const response =
            await getPracticaRequisitosDocumentoRequest(
                practica_id
            );

        return response.data;

    },


    async findByPracticaAndRol(
        practica_id,
        rol_id
    ) {

        const response =
            await getPracticaRequisitosDocumentoByRolRequest(
                practica_id,
                rol_id
            );

        return response.data;

    },


    async create(data) {

        const response =
            await createPracticaRequisitoDocumentoRequest(
                data
            );

        return response.data;

    },


    async delete(id) {

        const response =
            await deletePracticaRequisitoDocumentoRequest(
                id
            );

        return response.data;

    },


    async findById(id) {

        const response =
            await getPracticaRequisitoDocumentoByIdRequest(
                id
            );

        return response.data;

    },


    async update(id, data) {

        const response =
            await updatePracticaRequisitoDocumentoRequest(
                id,
                data
            );

        return response.data;

    }

};