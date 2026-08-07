export const editarGrupo = async (
  repos,
  id,
  data
) => {

  return await repos.grupoRepository.editarGrupo(id,data);
};