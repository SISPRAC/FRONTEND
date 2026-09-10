export const obtenerEntregasInformePorPracticaPracticante = async (
    { entregaInformeRepository },
    practica_practicante_id
) => {

    return await entregaInformeRepository.findByPracticaPracticanteId(
        practica_practicante_id
    );

};