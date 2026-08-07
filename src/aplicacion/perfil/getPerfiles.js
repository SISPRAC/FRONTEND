export const getPerfiles = async ({perfilRepository}) => {
  return await perfilRepository.getAll();
};