export const obtenerSolicitudesVisitaPorPractica = async (
    { solicitudVisitaRepository },
    practicaId
) => {

    return await solicitudVisitaRepository.getSolicitudesPorPractica(
        practicaId
    );

};