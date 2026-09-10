export const actualizarPracticaInforme = async (
    { practicaInformeRepository },
    id,
    data
) => {

    return await practicaInformeRepository.update(
        id,
        data
    );

};