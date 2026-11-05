export const actualizarTipoInforme = async (
    { tipoInformeRepository },
    id,
    data
) => {

    return await tipoInformeRepository.update(
        id,
        data
    );

};