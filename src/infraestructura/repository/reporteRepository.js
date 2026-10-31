import { obtenerDashboardReporteRequest } from "../api/reportes.api";

export const reporteRepository = {
  async getDashboard(periodoId) {
    const response = await obtenerDashboardReporteRequest(periodoId);
    return response.data;
  },
};