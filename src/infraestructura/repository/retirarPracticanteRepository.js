import {
    crearRetiroPracticanteRequest,
    getRetirosRequest,
    getRetiroRequest,
    getRetirosDePracticanteRequest
} from "../api/retirarPracticante.api.js";


export const retiroPracticanteRepository = {

    async create(data) {
        const response = await crearRetiroPracticanteRequest(data);

        return response.data;
    },


    async getAll() {
        const response = await getRetirosRequest();

        return response.data;
    },


    async findById(id) {
        const response = await getRetiroRequest(id);

        return response.data;
    },


    async findByPracticanteId(practicanteId) {
        const response = await getRetirosDePracticanteRequest(
            practicanteId
        );

        return response.data;
    }

};