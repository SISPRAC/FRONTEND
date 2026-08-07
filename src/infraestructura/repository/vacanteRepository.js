import {  getVacantesRequest } from "../api/vacante.api.js";

export const vacanteRepository = {
  async getAll() {
    const response = await  getVacantesRequest();
    return response.data;
  },
};