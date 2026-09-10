export const eliminarTipoInforme = async (
    { tipoInformeRepository },
    id
) => {

    return await tipoInformeRepository.delete(id);

};