export const getConveniosByEmpresa = async (
    convenioRepository,
    empresa_id
) => {

    return await convenioRepository.getAllByEmpresa(empresa_id);

};