export const getEncuestas = async (
    { encuestaRepository }
) => {

    return await encuestaRepository.getAll();

};