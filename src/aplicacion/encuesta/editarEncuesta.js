export const actualizarEncuesta = async (
    { encuestaRepository },
    id,
    data
) => {

    return await encuestaRepository.editarEncuesta(
        id,
        data
    );

};