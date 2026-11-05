import axios from "axios";

const departamentoMunicipioApi = axios.create({
    baseURL: "http://localhost:3000/api/departamento/municipio",
    withCredentials: true,
});

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