import {
  getAperturasVacantesRequest,
  getVacantesByEmpresaRequest,
  getVacanteByIdRequest,
  crearVacanteRequest,
  actualizarVacanteRequest,
  eliminarVacanteRequest
} from "../api/vacante.api.js";


export const vacanteRepository = {

  // ============================================================
  // TODAS LAS APERTURAS
  // ============================================================

  async getAperturas() {

    const response =
      await getAperturasVacantesRequest();

    return response.data;
  },


  // ============================================================
  // VACANTES DE LA EMPRESA AUTENTICADA
  // ============================================================

  async getByEmpresa() {

    const response =
      await getVacantesByEmpresaRequest();

    return response.data;
  },


  // ============================================================
  // UNA VACANTE ESPECÍFICA
  // ============================================================

  async getById(id) {

    const response =
      await getVacanteByIdRequest(id);

    return response.data;
  },


  // ============================================================
  // CREAR VACANTE
  // ============================================================

  async create(data) {

    const response =
      await crearVacanteRequest(data);

    return response.data;
  },


  // ============================================================
  // ACTUALIZAR VACANTE
  // ============================================================

  async update(id, data) {

    const response =
      await actualizarVacanteRequest(
        id,
        data
      );

    return response.data;
  },


  // ============================================================
  // ELIMINAR / CERRAR VACANTE
  // ============================================================

  async delete(id) {

    const response =
      await eliminarVacanteRequest(id);

    return response.data;
  }

};