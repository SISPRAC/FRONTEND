export const getGrupos = async ({grupoRepository}) => {
  return await grupoRepository.getAll();
};