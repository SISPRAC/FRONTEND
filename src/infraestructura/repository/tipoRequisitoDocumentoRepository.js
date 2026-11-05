import {
    getTiposRequisitoDocumentoRequest,
    getTiposRequisitoDocumentoByRolRequest,
    createTipoRequisitoDocumentoRequest,
    deleteTipoRequisitoDocumentoRequest,
    getTipoRequisitoDocumentoByIdRequest,
    updateTipoRequisitoDocumentoRequest
} from "../api/tipoRequisitoDocumento.api.js";


export const tipoRequisitoDocumentoRepository = {

    async findAll() {

        const response =
            await getTiposRequisitoDocumentoRequest();

        return response.data;

    },


    async findByRol(rol_id) {

        const response =
            await getTiposRequisitoDocumentoByRolRequest(
                rol_id
            );

        return response.data;

    },


    async create(data) {

        const response =
            await createTipoRequisitoDocumentoRequest(
                data
            );

        return response.data;

    },


    async delete(id) {

        const response =
            await deleteTipoRequisitoDocumentoRequest(
                id
            );

        return response.data;

    },


    async findById(id) {

        const response =
            await getTipoRequisitoDocumentoByIdRequest(
                id
            );

        return response.data;

    },


    async update(id, data) {

        const response =
            await updateTipoRequisitoDocumentoRequest(
                id,
                data
            );

        return response.data;

    }

};