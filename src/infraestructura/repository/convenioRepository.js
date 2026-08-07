import { getConveniosRequest, getConvenioRequest, actualizarEstadoConvenioRequest} from "../api/convenio.api";

export const convenioRepository = {
  async getAll() {
    const response = await getConveniosRequest();
    return response.data;
  },
  async getById(id) {
    const response = await getConvenioRequest(id);
    return response.data;
  },
   async actualizarEstadoConvenio(id, data) {
        const response = await actualizarEstadoConvenioRequest(
            id,
            data
        );
        return response.data;
    }

};