export const crearRetiroPracticante = async (
    { retiroPracticanteRepository },
    data
) => {
    return await retiroPracticanteRepository.create(data);

};