export const obtenerCandidatosParaReportePorPeriodo = async (
  { candidatoRepository },
  periodo_id
) => {
  const response =
    await candidatoRepository.getCandidatosParaReportePorPeriodo(periodo_id);

  return response.data;
};