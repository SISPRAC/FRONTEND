import {
  crearAperturaVacanteRequest,
  actualizarAperturaVacanteRequest,
  getAperturasVacantesRequest,
  getAperturaVacanteByIdRequest,
  eliminarAperturaVacanteRequest
} from "../api/aperturaVacante.api.js";


export const aperturaVacanteRepository = {

  async create(data) {

    const response =
      await crearAperturaVacanteRequest(data);

    return response.data;
  },


  async update(id, data) {

    const response =
      await actualizarAperturaVacanteRequest(
        id,
        data
      );

    return response.data;
  },


  async getAll() {

    const response =
      await getAperturasVacantesRequest();

    return response.data;
  },


  async getById(id) {

    const response =
      await getAperturaVacanteByIdRequest(id);

    return response.data;
  },


  async delete(id) {

    const response =
      await eliminarAperturaVacanteRequest(id);

    return response.data;
  }

};