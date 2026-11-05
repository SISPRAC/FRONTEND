export const getDashboardReporte = async (
  { reporteRepository },
  periodoId
) => {
  if (!periodoId) {
    throw new Error("El período es obligatorio.");
  }

  return await reporteRepository.getDashboard(periodoId);
};