export const obtenerCandidatosEmpresa = async (
    postulacionRepository
) => {

    const response =
        await postulacionRepository.getCandidatosEmpresa();

    return response.data;
};