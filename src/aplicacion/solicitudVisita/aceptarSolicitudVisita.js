export const aceptarSolicitudVisita = async (
    { solicitudVisitaRepository },
    data
) => {

    return await solicitudVisitaRepository.crearVisita(
        data
    );

};

