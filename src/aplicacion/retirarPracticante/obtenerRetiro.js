export const obtenerRetiroPracticante = async (
    { retiroPracticanteRepository },
    practicanteId
) => {

    const response =
        await retiroPracticanteRepository.findByPracticanteId(practicanteId);

    // El backend responde { data: [...] }
    const retiros = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
            ? response
            : [];

    // Un practicante puede tener varios retiros: se toma el más reciente
    return [...retiros].sort(
        (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
    )[0] ?? null;

};