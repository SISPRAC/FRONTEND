import {
    getDocumentosConvenioEmpresaRequest,
    subirDocumentoConvenioEmpresaRequest,
    reemplazarDocumentoConvenioEmpresaRequest,
    getRevisionRequisitosEmpresaRequest,
    reviewDocumentoConvenioEmpresaRequest
} from "../api/empresaRequisitoDocumento.api.js";

export const empresaRequisitoDocumentoRepository = {

    async findByEmpresa(empresa_id) {
        const response = await getDocumentosConvenioEmpresaRequest(empresa_id);
        return response.data;
    },

    async subir(data) {
        const response = await subirDocumentoConvenioEmpresaRequest(data);
        return response.data;
    },

    async reemplazar(data) {
        const response = await reemplazarDocumentoConvenioEmpresaRequest(data);
        return response.data;
    },

    async findRevisionByEmpresa(empresa_id) {
        const response = await getRevisionRequisitosEmpresaRequest(empresa_id);
        return response.data;
    },

    async revisarDocumento(id, data) {
        const response = await reviewDocumentoConvenioEmpresaRequest(id, data);
        return response.data;
    }

};