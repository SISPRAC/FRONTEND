export const invitarTutorEmpresarial = async ({
  tutorEmpresarialRepository
}, correo) => {

  return await tutorEmpresarialRepository.invitar(correo);

};