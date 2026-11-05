export const obtenerRespuestasEncuestasPracticante = async (
    { encuestaRepository },
    practicante_id
) => {
    return await encuestaRepository.obtenerRespuestasEncuestasPracticante(
        practicante_id
    );
};