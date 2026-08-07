export const actualizarPeriodoPlantilla = async (
    { encuestaRepository },
    id,
    data
) => {

    return await encuestaRepository.editarPeriodoPlantilla(
        id,
        data
    );

};