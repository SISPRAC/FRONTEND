export const getRoles = async (rolRepository) => {
  return await rolRepository.getAll();
};