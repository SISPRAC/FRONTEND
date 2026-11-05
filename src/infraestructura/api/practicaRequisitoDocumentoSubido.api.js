import axios from "axios";

const practicaRequisitoDocumentoSubidoApi = axios.create({
    baseURL: "http://localhost:3000/api/practicaRequisitoDocumentoSubido",
    withCredentials: true
});

practicaRequisitoDocumentoSubidoApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Obtener los documentos del usuario autenticado
export const obtenerMisDocumentosRequisitosRequest = () => {
    return practicaRequisitoDocumentoSubidoApi.get("/mis-documentos");
};


// Obtener un documento subido por ID
export const obtenerPracticaRequisitoDocumentoSubidoRequest = (id) => {
    return practicaRequisitoDocumentoSubidoApi.get(`/${id}`);
};


// Obtener los documentos de un practicante por usuario y práctica
export const obtenerDocumentosPracticantePorPracticaRequest = (
    usuario_id,
    practica_id
) => {
    return practicaRequisitoDocumentoSubidoApi.get(
        `/practicante/${usuario_id}/practica/${practica_id}`
    );
};

// Obtener los documentos de una empresa por usuario y práctica
export const obtenerDocumentosEmpresaPorPracticaRequest = (
    usuario_id,
    practica_id
) => {
    return practicaRequisitoDocumentoSubidoApi.get(
        `/empresa/${usuario_id}/practica/${practica_id}`
    );
};

// Obtener las empresas y el estado de sus documentos por práctica
export const obtenerEmpresasDocumentosPorPracticaRequest = (practica_id) => {
    return practicaRequisitoDocumentoSubidoApi.get(
        `/empresas/practica/${practica_id}`
    );
};


// Subir un documento de requisito por primera vez
export const subirPracticaRequisitoDocumentoRequest = (formData) => {
    return practicaRequisitoDocumentoSubidoApi.post("/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};


// Editar un documento de requisito existente
export const editarPracticaRequisitoDocumentoRequest = (formData) => {
    return practicaRequisitoDocumentoSubidoApi.put("/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
};


// Aprobar un documento de requisito
export const aprobarDocumentoRequisitoRequest = (id) => {
    return practicaRequisitoDocumentoSubidoApi.patch(`/${id}/aprobar`);
};


// Rechazar un documento de requisito
export const rechazarDocumentoRequisitoRequest = (id, observacion) => {
    return practicaRequisitoDocumentoSubidoApi.patch(
        `/${id}/rechazar`,
        { observacion }
    );
};