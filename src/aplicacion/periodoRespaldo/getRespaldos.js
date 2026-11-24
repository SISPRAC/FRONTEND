export const getRespaldos = async (repos) => {
  return await repos.periodoRespaldoRepository.getAll();
};
