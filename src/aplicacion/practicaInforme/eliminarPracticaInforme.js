export const eliminarPracticaInforme = async (
    { practicaInformeRepository },
    id
) => {

    return await practicaInformeRepository.delete(id);

};