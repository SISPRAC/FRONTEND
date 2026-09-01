export const registerCandidato = async (
  { candidatoRepository },
  data,
  token
) => {

  return await candidatoRepository.register(
    data,
    token
  );

};