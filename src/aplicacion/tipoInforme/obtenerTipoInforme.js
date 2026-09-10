export const obtenerTipoInforme = async (
    { tipoInformeRepository },
    id
) => {

    return await tipoInformeRepository.findById(id);

};