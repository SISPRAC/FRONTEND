export const crearSolicitudVisita = async (
    { solicitudVisitaRepository },
    data
) => {

    return await solicitudVisitaRepository.crear(
        data
    );

};