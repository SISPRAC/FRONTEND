export const obtenerEncuestasPracticante = async (
    { encuestaRepository }
) => {

    return await encuestaRepository.obtenerEncuestasPracticante();

};