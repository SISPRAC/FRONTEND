export const obtenerVisitasPorPracticante = async (
    { visitaRepository },
    practicanteId
) => {
    if (!practicanteId) {
        throw new Error("El ID del practicante es obligatorio.");
    }

    return await visitaRepository.obtenerVisitasPorPracticante(
        practicanteId
    );
};