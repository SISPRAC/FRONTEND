export const invitarCandidato = async (
  candidatoRepository,
  data
) => {

  return await candidatoRepository.invitar(data);

};