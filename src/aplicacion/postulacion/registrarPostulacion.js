export const registrarPostulacion = async (
    { postulacionRepository },
    aperturaVacanteId,
    candidatosIds
) => {

    return await postulacionRepository.register({
        aperturaVacanteId,
        candidatosIds
    });

};