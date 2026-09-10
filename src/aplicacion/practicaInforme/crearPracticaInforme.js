export const crearPracticaInforme = async (
    { practicaInformeRepository },
    data
) => {

    return await practicaInformeRepository.create(data);

};