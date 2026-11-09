export const getHabilidadesBlandas = async ({ habilidadBlandaRepository }) => {

    return await habilidadBlandaRepository.getAll();

};