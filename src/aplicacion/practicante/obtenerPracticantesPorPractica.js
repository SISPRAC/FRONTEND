export const obtenerPracticantesPorPractica = async (
    { practicanteRepository },
    practicaId
) => {

    return await practicanteRepository.obtenerPracticantesPorPractica(
        practicaId
    );

};