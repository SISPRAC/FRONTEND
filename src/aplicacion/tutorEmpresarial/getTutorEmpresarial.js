export const getTutorEmpresariales = async ({ tutorEmpresarialRepository }) => {

  const res = await tutorEmpresarialRepository.getAll();
   return res;

};