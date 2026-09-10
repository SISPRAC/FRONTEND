import {
    getDepartamentosRequest,
    getMunicipiosPorDepartamentoRequest
} from "../api/departamentoMunicipio.api";

export const departamentoMunicipioRepository = {

    async getDepartamentos() {
        const response = await getDepartamentosRequest();

        return response.data;
    },

    async getMunicipiosPorDepartamento(departamentoId) {
        const response =
            await getMunicipiosPorDepartamentoRequest(
                departamentoId
            );

        return response.data;
    }

};