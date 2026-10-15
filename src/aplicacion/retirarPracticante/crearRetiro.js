export const crearRetiroPracticante = async (
    { retiroPracticanteRepository },
    data
) => {
    console.log("Datos recibidos en crearRetiroPracticante:", data);

    return await retiroPracticanteRepository.create(data);

};