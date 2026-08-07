export const getConvenio= async ({convenioRepository}, id) => {
  return await convenioRepository.getById(id);
};