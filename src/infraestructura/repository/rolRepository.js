import {
  crearRolRequest,
  getRolesRequest,
} from "../api/rol.api";

export const rolRepository = {
  async  create(data) {
    const response = await crearRolRequest(data);
    return response.data;
  },

  async getAll () {
    const response = await getRolesRequest();
    return response.data;
},
};