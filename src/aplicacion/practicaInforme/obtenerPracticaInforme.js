export const obtenerPracticaInforme = async (
    { practicaInformeRepository },
    id
) => {

    return await practicaInformeRepository.findById(id);

};