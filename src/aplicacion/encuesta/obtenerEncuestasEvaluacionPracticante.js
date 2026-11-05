export const obtenerEncuestasEvaluacionPracticante = async (
    { encuestaRepository },
    practicante_id,
    rolEvaluador
) => {

    return await encuestaRepository.obtenerEncuestasEvaluacionPracticante(
        practicante_id,
        rolEvaluador
    );

};