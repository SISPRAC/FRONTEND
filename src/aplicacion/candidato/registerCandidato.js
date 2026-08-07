export const registerCandidato = async (
  { candidatoRepository },
  data
) => {
  return await candidatoRepository.register(data);
};