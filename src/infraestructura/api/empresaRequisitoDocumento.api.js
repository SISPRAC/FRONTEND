import axios from "axios";

const empresaRequisitoDocumentoApi = axios.create({
    baseURL: "http://localhost:3000/api/empresaRequisitoDocumento",
    withCredentials: true
});

empresaRequisitoDocumentoApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Consultar documentos de una empresa
export const getDocumentosConvenioEmpresaRequest = async (empresa_id) => {
    return await empresaRequisitoDocumentoApi.get(`/empresa/${empresa_id}`);
};

// Subir documento
export const subirDocumentoConvenioEmpresaRequest = async (data) => {
    return await empresaRequisitoDocumentoApi.post("/subir", data);
};

// Reemplazar documento
export const reemplazarDocumentoConvenioEmpresaRequest = async (data) => {
    return await empresaRequisitoDocumentoApi.put("/reemplazar", data);
};

// Consultar revisión de requisitos de una empresa (Director / Administrador)
export const getRevisionRequisitosEmpresaRequest = async (empresa_id) => {
    return await empresaRequisitoDocumentoApi.get(`/revision/${empresa_id}`);
};

// Revisar documento (Director / Administrador)
export const reviewDocumentoConvenioEmpresaRequest = async (id, data) => {
    return await empresaRequisitoDocumentoApi.put(`/revisar/${id}`, data);
};