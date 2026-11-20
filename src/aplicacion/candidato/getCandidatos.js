export const getCandidatos = async ({candidatoRepository}) => {
  const res = await candidatoRepository.getAll();
  return res.data;
};



