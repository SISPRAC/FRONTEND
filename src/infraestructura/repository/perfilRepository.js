import { getPerfilesRequest, createPerfilRequest } from "../api/perfil.api.js";

export const perfilRepository = {
  async create(data) {
    const response = await createPerfilRequest(data);
    return response.data;
  },
  async getAll() {
    const response = await getPerfilesRequest();
    return response.data;
  },
};