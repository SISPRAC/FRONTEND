export const eliminarTipoRequisitoDocumento = async (
    { tipoRequisitoDocumentoRepository },
    id
) => {

    return await tipoRequisitoDocumentoRepository.delete(id);

};