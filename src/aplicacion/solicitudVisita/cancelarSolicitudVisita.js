export const cancelarSolicitudVisita = async (
    { solicitudVisitaRepository },
    id,
    motivo
) => {

    return await solicitudVisitaRepository.cancelar(
        id,
        motivo
    );

};