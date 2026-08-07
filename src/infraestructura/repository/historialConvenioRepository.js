import {registrarHistrialConvenioRequest} from "../api/historialConvenio.api";

export const historialConvenioRepository = {
  async registrar(data) {
    const response = await registrarHistrialConvenioRequest(data);
    return response.data;
  },
};