export const asignarEncuestaPractica = async (
    {encuestaRepository},
    data
) => {

    if (!data) {
        throw new Error(
            "Los datos para asignar la encuesta son obligatorios"
        );
    }

    return await encuestaRepository.asignarEncuestaPractica(
        data
    );
};