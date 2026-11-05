
export const obtenerVisitaPorSolicitud = async (
    { visitaRepository },
    solicitudVisitaId
) => {
    if (!solicitudVisitaId) {
        throw new Error("El ID de la solicitud de visita es obligatorio.");
    }

    return await visitaRepository.obtenerVisitaPorSolicitud(
        solicitudVisitaId
    );
};
