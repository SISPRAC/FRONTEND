export const actualizarArlPractica = async (
    { practicaRepository },
    id,
    archivo
) => {

    return await practicaRepository.actualizarArlPractica(
        id,
        archivo
    );

};