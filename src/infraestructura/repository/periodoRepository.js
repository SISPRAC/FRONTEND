import { getPeriodosRequest, createPeriodoRequest, 
  deletePeriodoRequest, updatePeriodoRequest, getPeriodoByIdRequest} from "../api/periodo.api";

export const periodoRepository = {
  async getAll() {
    const response = await getPeriodosRequest();
    return response.data;
  },

   async create(data) {
    const response = await createPeriodoRequest(data);
    return response.data;
  },

  async delete(id) {
    const response = await deletePeriodoRequest(id);
    return response.data;
  },

  async update(id, data) {
    const response = await updatePeriodoRequest(
      id,
      data
    );
    return response.data;
  },

  async findById(id) {
    const response = await getPeriodoByIdRequest(id);
    return response.data;
  }
};