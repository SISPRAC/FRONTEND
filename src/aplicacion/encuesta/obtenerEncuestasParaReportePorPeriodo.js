export const obtenerEncuestasParaReportePorPeriodo = async (
  { encuestaRepository },
  periodo_id
) => {
  return await encuestaRepository.getEncuestasParaReportePorPeriodo(periodo_id);
};
