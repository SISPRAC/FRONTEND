export const getPracticaById = async (
    { practicaRepository },
    id
) => {

    return await practicaRepository.getPracticaById(id);

};