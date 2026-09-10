export const getAperturasByPractica = async (
    {
        tutorEmpresarialRepository
    },
    practicaId
) => {

    return await tutorEmpresarialRepository.getAperturasByPractica(
        practicaId
    );

};