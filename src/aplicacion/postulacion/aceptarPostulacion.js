export const aceptarPostulacion = async (
    postulacionRepository,
    postulacionId
) => {

    const response =
        await postulacionRepository.aceptarPostulacion(
            postulacionId
        );

    return response.data;
};