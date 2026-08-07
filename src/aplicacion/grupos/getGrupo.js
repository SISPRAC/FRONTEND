export const getGrupo = async ({grupoRepository}, id) => {
  return await grupoRepository.getById(id);
};