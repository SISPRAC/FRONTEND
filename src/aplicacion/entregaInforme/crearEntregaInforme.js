export const crearEntregaInforme = async (
    { entregaInformeRepository },
    data
) => {

    return await entregaInformeRepository.create(data);

};