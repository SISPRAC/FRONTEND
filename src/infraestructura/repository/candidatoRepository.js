import {registerCandidatoRequest , getCandidatos, getCandidatosDisponibles, getCandidatosPerfil} from "../api/candidato.api"

export const candidatoRepository = {
  async register(data) {
    return await registerCandidatoRequest(data);
  },
  async getAll() {
    return await getCandidatos();
  },
  async getDisponibles() {
    return await getCandidatosDisponibles();
  },
  async getCandidatosPerfiles(PerfilNombre){
    return await getCandidatosPerfil(PerfilNombre);
  }
};
