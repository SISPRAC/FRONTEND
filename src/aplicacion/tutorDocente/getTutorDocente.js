export const getTutorDocentes = async ({tutorDocenteRepository}) => {
  const res = await tutorDocenteRepository.getAll();
  return res.data;
};