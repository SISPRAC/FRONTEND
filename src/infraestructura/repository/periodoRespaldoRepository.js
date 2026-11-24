import { getRespaldosRequest } from "../api/periodoRespaldo.api";

export const periodoRespaldoRepository = {
  async getAll() {
    const response = await getRespaldosRequest();
    return response.data;
  },
};
