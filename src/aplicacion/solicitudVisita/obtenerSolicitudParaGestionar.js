export const obtenerSolicitudParaGestionar = async (
    { solicitudVisitaRepository },
    id
) => {

    return await solicitudVisitaRepository.getSolicitudParaGestionar(
        id
    );

};