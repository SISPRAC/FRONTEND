export const eliminarEncuesta = async (
    { encuestaRepository },
    id
) => {

    return await encuestaRepository.delete(id);

};