export const subirDocumentoConvenioEmpresa = async (
    { empresaRequisitoDocumentoRepository },
    formData
) => {
    return await empresaRequisitoDocumentoRepository.subir(formData);
};