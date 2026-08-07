export const getCandidatosDisponibles = async ({candidatoRepository}) => {
  return await candidatoRepository.getDisponibles();
};