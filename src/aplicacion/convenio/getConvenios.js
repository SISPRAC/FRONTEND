export const getConvenios = async (repos) => {
  return await repos.convenioRepository.getAll();
};