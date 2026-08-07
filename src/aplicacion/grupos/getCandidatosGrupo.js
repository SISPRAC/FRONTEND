export const getCandidatosGrupo = async ({grupoRepository}, id) => {
  return await grupoRepository.getCandidatosById(id);
};