export const invitarTutorDocente = async (
  tutorDocenteRepository,
  correo
) => {
  return await tutorDocenteRepository.invitar(correo);
};

