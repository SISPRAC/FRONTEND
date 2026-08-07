export const getVacantes = async ({vacanteRepository}) => {
  return await vacanteRepository.getAll();
};