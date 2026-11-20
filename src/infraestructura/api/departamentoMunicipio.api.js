import { createApi } from "./createApi.js";

const departamentoMunicipioApi =  createApi("/departamento/municipio");


export const getDepartamentosRequest = async () => {
    return await departamentoMunicipioApi.get("/");
};

export const getMunicipiosPorDepartamentoRequest = async (
    departamentoId
) => {
    return await departamentoMunicipioApi.get(
        `/${departamentoId}/municipios`
    );
};