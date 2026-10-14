export const editarSolicitudVisita = async (
    { solicitudVisitaRepository },
    id,
    data
) => {

    return await solicitudVisitaRepository.editar(
        id,
        data
    );

};