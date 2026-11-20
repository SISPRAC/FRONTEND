export const verificarCandidatosPdf = async ({ candidatoRepository }, alumnos) => {
  return await candidatoRepository.verificarPdf(alumnos);
};