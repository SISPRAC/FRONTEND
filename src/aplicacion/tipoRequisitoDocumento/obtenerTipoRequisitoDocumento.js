export const obtenerTipoRequisitoDocumento = async (
    { tipoRequisitoDocumentoRepository },
    id
) => {

    return await tipoRequisitoDocumentoRepository.findById(id);

};