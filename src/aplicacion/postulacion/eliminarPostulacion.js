export const eliminarPostulacion = (
    postulacionRepository,
    aperturaVacanteId,
    candidatoId
) => {
    return postulacionRepository.eliminarPostulacionR(
        aperturaVacanteId,
        candidatoId
    );
};