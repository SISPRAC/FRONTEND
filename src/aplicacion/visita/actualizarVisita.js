export const actualizarVisita = async ({
    visitaRepository,
    visitaId,
    data
}) => {

    const res =
        await visitaRepository.actualizarVisita(
            visitaId,
            data
        );

    return res.data;
};