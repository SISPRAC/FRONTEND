export const responderEncuestaPracticante = async (
    { encuestaRepository },
    data
) => {

    return await encuestaRepository.responderEncuestaPracticante(
        data
    );

};