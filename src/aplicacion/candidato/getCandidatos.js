export const getCandidatos = async ({candidatoRepository}) => {
  return await candidatoRepository.getAll();
};



