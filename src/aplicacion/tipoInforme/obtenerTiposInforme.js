export const obtenerTiposInforme = async (
    { tipoInformeRepository }
) => {

    return await tipoInformeRepository.findAll();

};