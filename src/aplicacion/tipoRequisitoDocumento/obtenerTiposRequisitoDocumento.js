export const obtenerTiposRequisitoDocumento = async (
    { tipoRequisitoDocumentoRepository }
) => {

    return await tipoRequisitoDocumentoRepository.findAll();

};