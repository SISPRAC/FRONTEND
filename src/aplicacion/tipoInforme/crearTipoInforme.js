export const crearTipoInforme = async (
    { tipoInformeRepository },
    data
) => {

    return await tipoInformeRepository.create(data);

};