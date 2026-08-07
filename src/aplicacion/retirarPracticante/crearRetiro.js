export const crearRetiroPracticante = async (
    retiroPracticanteRepository,
    data
) => {

    const {
        motivo,
        practicante_id,
        cv
    } = data;


    const formData = new FormData();

    formData.append(
        "fecha_retiro",
        new Date().toISOString().split("T")[0]
    );

    formData.append(
        "motivo",
        motivo
    );

    formData.append(
        "practicante_id",
        practicante_id
    );

    formData.append(
        "cv",
        cv
    );


    return await retiroPracticanteRepository.create(
        formData
    );

};