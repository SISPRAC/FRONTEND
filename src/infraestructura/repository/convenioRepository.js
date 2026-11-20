import {
    getConveniosRequest,
    getConvenioRequest,
    getConvenioByEmpresaRequest,
    getConveniosByEmpresaRequest,
    subirConvenioRequest,
    actualizarEstadoConvenioRequest,
    aprobarConvenioRequest
} from "../api/convenio.api";


export const convenioRepository = {

    async getAll() {

        const response = await getConveniosRequest();

        return response.data;
    },


    async getById(id) {

        const response = await getConvenioRequest(id);

        return response.data;
    },


    async getByEmpresa(empresa_id) {

        const response =
            await getConvenioByEmpresaRequest(empresa_id);

        return response.data;
    },


    async getAllByEmpresa(empresa_id) {

        const response =
            await getConveniosByEmpresaRequest(empresa_id);

        return response.data;
    },


    async subirConvenio(formData) {

        const response =
            await subirConvenioRequest(formData);

        return response.data;
    },


    async actualizarEstadoConvenio(id, data) {

        const response =
            await actualizarEstadoConvenioRequest(id, data);

        return response.data;
    },


    async aprobarConvenio(id, formData) {

        const response =
            await aprobarConvenioRequest(id, formData);

        return response.data;
    }

};