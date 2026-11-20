export const obtenerRevisionRequisitosEmpresa = async (
    { empresaRequisitoDocumentoRepository },
    empresa_id
) => {
    return await empresaRequisitoDocumentoRepository.findRevisionByEmpresa(empresa_id);
};