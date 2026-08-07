export const getEncuesta = async (
    { encuestaRepository },
    id
) => {

    return await encuestaRepository.getById(id);

};