export const updatePeriodo = async (
  repos,
  id,
  data
) => {

  return await repos.periodoRepository.update(
    id,
    data
  );

};