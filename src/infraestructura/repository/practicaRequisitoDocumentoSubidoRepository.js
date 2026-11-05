import {
    obtenerMisDocumentosRequisitosRequest,
    obtenerPracticaRequisitoDocumentoSubidoRequest,
    obtenerDocumentosPracticantePorPracticaRequest,
    obtenerDocumentosEmpresaPorPracticaRequest,
    obtenerEmpresasDocumentosPorPracticaRequest,
    subirPracticaRequisitoDocumentoRequest,
    editarPracticaRequisitoDocumentoRequest,
    aprobarDocumentoRequisitoRequest,
    rechazarDocumentoRequisitoRequest
} from "../api/practicaRequisitoDocumentoSubido.api";


export const practicaRequisitoDocumentoSubidoRepository = {

    // Obtener los documentos del usuario autenticado
    async getMisDocumentos() {
        const response =
            await obtenerMisDocumentosRequisitosRequest();

        return response.data;
    },

    // Obtener un documento por ID
    async getById(id) {
        const response =
            await obtenerPracticaRequisitoDocumentoSubidoRequest(id);

        return response.data;
    },

    // Obtener los documentos de un practicante por usuario y práctica
    async getDocumentosPracticantePorPractica(usuario_id, practica_id) {
        const response =
            await obtenerDocumentosPracticantePorPracticaRequest(
                usuario_id,
                practica_id
            );

        return response.data;
    },

    // Obtener los documentos de una empresa por usuario y práctica
    async getDocumentosEmpresaPorPractica(usuario_id, practica_id) {
        const response =
            await obtenerDocumentosEmpresaPorPracticaRequest(
                usuario_id,
                practica_id
            );

        return response.data;
    },

    // Obtener las empresas y sus documentos por práctica
    async getEmpresasDocumentosPorPractica(practica_id) {
        const response =
            await obtenerEmpresasDocumentosPorPracticaRequest(practica_id);

        return response.data;
    },

    // Subir un documento de requisito
    async subirDocumento(formData) {
        const response =
            await subirPracticaRequisitoDocumentoRequest(formData);

        return response.data;
    },

    // Editar un documento de requisito existente
    async editarDocumento(formData) {
        const response =
            await editarPracticaRequisitoDocumentoRequest(formData);

        return response.data;
    },

    // Aprobar un documento de requisito
    async aprobarDocumento(id) {
        const response =
            await aprobarDocumentoRequisitoRequest(id);

        return response.data;
    },

    // Rechazar un documento de requisito
    async rechazarDocumento(id, observacion) {
        const response =
            await rechazarDocumentoRequisitoRequest(id, observacion);

        return response.data;
    }

};