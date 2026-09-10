import {
    getTiposInformeRequest,
    createTipoInformeRequest,
    deleteTipoInformeRequest,
    getTipoInformeByIdRequest,
    updateTipoInformeRequest
} from "../api/tipoInforme.api.js";


export const tipoInformeRepository = {

    async findAll() {

        const response =
            await getTiposInformeRequest();

        return response.data;

    },


    async create(data) {

        const response =
            await createTipoInformeRequest(data);

        return response.data;

    },


    async delete(id) {

        const response =
            await deleteTipoInformeRequest(id);

        return response.data;

    },


    async findById(id) {

        const response =
            await getTipoInformeByIdRequest(id);

        return response.data;

    },


    async update(id, data) {

        const response =
            await updateTipoInformeRequest(
                id,
                data
            );

        return response.data;

    }

};