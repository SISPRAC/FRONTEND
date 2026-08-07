import {
    createPracticaRequisitoDocumentoRequest,
    updatePracticaRequisitoDocumentoRequest,
    deletePracticaRequisitoDocumentoRequest,
    getPracticaRequisitoDocumentoRequest,
    getPracticaRequisitosDocumentoByPracticaRequest,
    getPracticaRequisitosDocumentoByRolRequest,
} from "../api/practicaRequisitoDocumento.api.js";


const buildFormData = (data) => {

    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {

        if (
            value !== null &&
            value !== undefined &&
            key !== "archivo"
        ) {

            formData.append(key, value);

        }

    });

    if (data.archivo) {

        formData.append("archivo", data.archivo);

    }

    return formData;

};


export const practicaRequisitoDocumentoRepository = {

    async create(data) {

        const response =
            await createPracticaRequisitoDocumentoRequest(
                buildFormData(data)
            );

        return response.data;

    },

    async update(id, data) {

        const response =
            await updatePracticaRequisitoDocumentoRequest(
                id,
                buildFormData(data)
            );

        return response.data;

    },

    async delete(id) {

        const response =
            await deletePracticaRequisitoDocumentoRequest(id);

        return response.data;

    },

    async findById(id) {

        const response =
            await getPracticaRequisitoDocumentoRequest(id);

        return response.data;

    },

    async findByPracticaId(practica_id) {

        const response =
            await getPracticaRequisitosDocumentoByPracticaRequest(
                practica_id
            );

        return response.data;

    },

    async findByPracticaAndRol(practica_id, rol_id) {

        const response =
            await getPracticaRequisitosDocumentoByRolRequest(
                practica_id,
                rol_id
            );

        return response.data;

    }

};