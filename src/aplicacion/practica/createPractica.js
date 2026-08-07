export const createPractica = async (
    { practicaRepository },
    data
) => {

    return await practicaRepository.createPractica(data);

};