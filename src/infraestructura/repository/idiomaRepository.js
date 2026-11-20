import {
    getIdiomasRequest
} from "../api/idioma.api.js";

export const idiomaRepository = {

    async getAll() {
        const response = await getIdiomasRequest();
        return response.data;
    }

};