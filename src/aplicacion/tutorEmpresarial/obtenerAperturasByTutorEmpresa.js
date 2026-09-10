export const obtenerAperturasByTutorEmpresa = async ({
    tutorEmpresarialRepository,
    periodoId,
    practicaId
}) => {

    return await tutorEmpresarialRepository.getAperturasByTutorEmpresa(
        periodoId,
        practicaId
    );

};
