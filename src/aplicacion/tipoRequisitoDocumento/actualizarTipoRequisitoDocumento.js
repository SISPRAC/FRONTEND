export const actualizarTipoRequisitoDocumento = async (
    { tipoRequisitoDocumentoRepository },
    id,
    data
) => {

    return await tipoRequisitoDocumentoRepository.update(
        id,
        data
    );

};