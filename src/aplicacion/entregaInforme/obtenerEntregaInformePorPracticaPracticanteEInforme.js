export const obtenerEntregaInformePorPracticaPracticanteEInforme = async (
    { entregaInformeRepository },
    practica_practicante_id,
    practica_informe_id
) => {

    return await entregaInformeRepository.findByPracticaPracticanteAndInforme(
        practica_practicante_id,
        practica_informe_id
    );

};
