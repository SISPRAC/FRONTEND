export const getDashboardReporte = async (
  { reporteRepository },
  periodoId,
  empresaId // opcional: undefined = todas las empresas
) => {
  if (!periodoId) {
    throw new Error("El período es obligatorio.");
  }

  return await reporteRepository.getDashboard(periodoId, empresaId);
};