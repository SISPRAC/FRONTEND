import {
  registerCandidatoRequest,
  updateCandidatoRequest,
  getCandidatos,
  getCandidatosDisponibles,
  getCandidatosPerfil,
  invitarCandidatoRequest
} from "../api/candidato.api";

export const candidatoRepository = {

  async register(data, token) {
    return await registerCandidatoRequest(data, token);
  },

  async update(id, data) {
    return await updateCandidatoRequest(id, data);
  },

  async getAll() {
    return await getCandidatos();
  },

  async getDisponibles() {
    return await getCandidatosDisponibles();
  },

  async getCandidatosPerfiles(PerfilNombre) {
    return await getCandidatosPerfil(PerfilNombre);
  },

  async invitar(data) {
    return await invitarCandidatoRequest(data);
  },

};