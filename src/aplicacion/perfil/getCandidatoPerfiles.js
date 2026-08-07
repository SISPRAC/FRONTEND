export const getCandidatosPerfil = async ({candidatoRepository},PerfilNombre) => {
  return await candidatoRepository.getCandidatosPerfiles(PerfilNombre);
};