export const rechazarSolicitudVisita = async (
    { solicitudVisitaRepository },
    data
) => {

    console.log("Entre a rechazar :3");

    return await solicitudVisitaRepository.rechazar(
        data
    );

};
