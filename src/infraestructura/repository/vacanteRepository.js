import {
  getAperturasVacantesRequest,
  getVacantesByEmpresaRequest,
  getVacanteByIdRequest,
  crearVacanteRequest,
  actualizarVacanteRequest
} from "../api/vacante.api.js";


export const vacanteRepository = {

  // Todas las aperturas para administrador/director
  async getAperturas() {

    const response =
      await getAperturasVacantesRequest();

    return response.data;
  },


  // Vacantes de la empresa autenticada
  async getByEmpresa() {

    const response =
      await getVacantesByEmpresaRequest();

    return response.data;
  },


  // Una vacante específica
  async getById(id) {

    const response =
      await getVacanteByIdRequest(id);

    return response.data;
  },


  // Crear vacante
  async create(data) {

    const response =
      await crearVacanteRequest(data);

    return response.data;
  },


  // Actualizar vacante
  async update(id, data) {

    const response =
      await actualizarVacanteRequest(
        id,
        data
      );

    return response.data;
  }

};