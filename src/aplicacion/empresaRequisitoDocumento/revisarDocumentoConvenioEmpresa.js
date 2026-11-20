export const revisarDocumentoConvenioEmpresa = async (
    { empresaRequisitoDocumentoRepository },
    id,
    data
) => {
    return await empresaRequisitoDocumentoRepository.revisarDocumento(id, data);
};