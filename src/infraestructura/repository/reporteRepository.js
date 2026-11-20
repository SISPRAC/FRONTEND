import { obtenerDashboardReporteRequest } from "../api/reportes.api";

export const reporteRepository = {
  async getDashboard(periodoId, empresaId) {
    const response = await obtenerDashboardReporteRequest(periodoId, empresaId);
    return response.data;
  },
};