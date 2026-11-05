export const obtenerVisita = async ({
    visitaRepository,
    visitaId
}) => {

    const res =
        await visitaRepository.obtenerVisita(
            visitaId
        );

    return res.data;
};