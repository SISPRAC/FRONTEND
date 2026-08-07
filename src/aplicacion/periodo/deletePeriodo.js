export const deletePeriodo = async (repos, id) => {

  return await repos.periodoRepository.delete(id);

};