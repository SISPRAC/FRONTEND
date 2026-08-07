export const crearEncuesta = async (
    { encuestaRepository },
    data
) => {

    return await encuestaRepository.create(data);

};