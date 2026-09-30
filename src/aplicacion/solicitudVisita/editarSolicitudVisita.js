export const editarSolicitudVisita = async (
    { solicitudVisitaRepository },
    id,
    data
) => {
    console.log("entre a editar ojito..");

    return await solicitudVisitaRepository.editar(
        id,
        data
    );

};