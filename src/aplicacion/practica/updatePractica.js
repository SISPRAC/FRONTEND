export const updatePractica = async (
    { practicaRepository },
    id,
    data
) => {

    return await practicaRepository.updatePractica(
        id,
        data
    );

};