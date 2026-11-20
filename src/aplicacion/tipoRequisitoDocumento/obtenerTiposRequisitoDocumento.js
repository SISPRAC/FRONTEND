export const obtenerTiposRequisitoDocumento = async (
    { tipoRequisitoDocumentoRepository },
    params
) => {

    return await tipoRequisitoDocumentoRepository.findAll(
        params
    );

};