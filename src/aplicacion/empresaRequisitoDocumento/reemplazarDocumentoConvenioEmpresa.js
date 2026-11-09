export const reemplazarDocumentoConvenioEmpresa = async (
    { empresaRequisitoDocumentoRepository },
    formData
) => {
    return await empresaRequisitoDocumentoRepository.reemplazar(formData);
};