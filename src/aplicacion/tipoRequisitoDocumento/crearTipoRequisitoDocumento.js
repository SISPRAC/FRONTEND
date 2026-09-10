export const crearTipoRequisitoDocumento = async (
    { tipoRequisitoDocumentoRepository },
    data
) => {

    return await tipoRequisitoDocumentoRepository.create(data);

};