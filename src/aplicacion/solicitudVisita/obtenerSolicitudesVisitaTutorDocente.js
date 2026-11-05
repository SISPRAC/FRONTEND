export const obtenerSolicitudesVisitaTutorDocente = async (
    { solicitudVisitaRepository }
) => {

    return await solicitudVisitaRepository.getMisSolicitudes();

};