import axios from "axios";

const empresaApi = axios.create({
    baseURL: "http://localhost:3000/api/empresa",
    withCredentials: true
});

export const registerEmpresaRequest = (data) => {
    return empresaApi.post(
        "/registrarEmpresa",
        data
    );
};