export const getCandidatosPerfil = async ({candidatoRepository},PerfilNombre) => {
  const candidatosPerfiles = await candidatoRepository.getCandidatosPerfiles(PerfilNombre);
  return candidatosPerfiles.data;
};