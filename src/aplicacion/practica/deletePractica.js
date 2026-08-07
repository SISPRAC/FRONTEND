export const deletePractica = async (
    { practicaRepository },
    id
) => {

    return await practicaRepository.deletePractica(id);

};