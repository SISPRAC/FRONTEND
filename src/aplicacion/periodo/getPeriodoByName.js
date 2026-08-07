export const getPeriodoById = async (repos, id) => {

  return await repos.periodoRepository.findById(id);

};