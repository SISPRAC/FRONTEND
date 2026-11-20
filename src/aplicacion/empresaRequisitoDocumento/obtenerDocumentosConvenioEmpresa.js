export const obtenerDocumentosConvenioEmpresa = async (
    { empresaRequisitoDocumentoRepository },
    empresa_id
) => {
    return await empresaRequisitoDocumentoRepository.findByEmpresa(empresa_id);
};