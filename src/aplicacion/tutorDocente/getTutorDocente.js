export const getTutorDocentes = async ({tutorDocenteRepository}) => {
  return await tutorDocenteRepository.getAll();
};