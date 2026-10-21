
import {
  getGruposRequest,
  createGrupoRequest,
  getCandidatosGrupoRequest,
  getGrupoRequest,
  getGruposByPracticaIdRequest,
  getPracticantesDocumentosByGrupoRequest,
  editarGrupoRequest,
  deleteGrupoRequest
} from "../api/grupos.api.js";


export const grupoRepository = {

  async create(data) {
    const response = await createGrupoRequest(data);
    return response.data;
  },

  async getAll() {
    const response = await getGruposRequest();
    return response.data;
  },

  async getById(id) {
    const response = await getGrupoRequest(id);
    return response.data;
  },

  async getGruposByPracticaId(practica_id) {
    const response = await getGruposByPracticaIdRequest(practica_id);
    return response.data;
  },

  async getCandidatosById(id) {
    const response = await getCandidatosGrupoRequest(id);
    return response.data;
  },

  async getPracticantesDocumentosByGrupoId(grupoId) {
    const response = await getPracticantesDocumentosByGrupoRequest(grupoId);
    return response.data;
  },

  async editarGrupo(id, data) {
    const response = await editarGrupoRequest(id, data);
    return response.data;
  },

  async delete(id) {
    const response = await deleteGrupoRequest(id);
    return response.data;
  }
};
