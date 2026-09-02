export const rechazarPostulacion = async (
    postulacionRepository,
    postulacionId,
    comentarioEmpresa = null
) => {

    const response =
        await postulacionRepository.rechazarPostulacion(
            postulacionId,
            comentarioEmpresa
        );

    return response.data;
};