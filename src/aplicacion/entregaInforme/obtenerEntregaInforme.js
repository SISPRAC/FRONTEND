export const obtenerEntregaInforme = async (
    { entregaInformeRepository },
    id
) => {

    return await entregaInformeRepository.findById(id);

};