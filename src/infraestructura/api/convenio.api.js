import axios from "axios";

const convenioApi = axios.create({
    baseURL: "http://localhost:3000/api/convenio",
    withCredentials: true
});


// Obtener todos los convenios
export const getConveniosRequest = () => {
    return convenioApi.get("/all");
};


// Obtener convenio por ID
export const getConvenioRequest = (id) => {
    return convenioApi.get(`/${id}`);
};


// Obtener convenio de una empresa
export const getConvenioByEmpresaRequest = (empresa_id) => {
    return convenioApi.get(`/empresa/${empresa_id}`);
};


// Obtener todos los convenios de una empresa
export const getConveniosByEmpresaRequest = (empresa_id) => {
    return convenioApi.get(`/empresa/${empresa_id}/todos`);
};


// Subir / crear / actualizar convenio
export const subirConvenioRequest = (formData) => {
    return convenioApi.post("/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};


// Actualizar estado del convenio
export const actualizarEstadoConvenioRequest = (id, data) => {
    return convenioApi.put(
        `/${id}/estado`,
        data
    );
};