export const getPeriodos = async (repos) => {
  return await repos.periodoRepository.getAll();
};