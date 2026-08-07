export const createGrupo = async (
  repos,
  data
) => {

  return await repos.grupoRepository.create(data);
};