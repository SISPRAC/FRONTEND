export const responderEncuestaEvaluacionPracticante = async (
    { encuestaRepository },
    data
) => {

    return await encuestaRepository.responderEncuestaEvaluacionPracticante(
        data
    );

};
