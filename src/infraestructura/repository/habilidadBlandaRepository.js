import {
    getHabilidadesBlandasRequest
} from "../api/habilidadBlanda.api.js";

export const habilidadBlandaRepository = {

    async getAll() {
        const response = await getHabilidadesBlandasRequest();
        return response.data;
    }

};