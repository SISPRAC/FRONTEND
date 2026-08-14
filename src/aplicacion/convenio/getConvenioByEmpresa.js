export const getConvenioByEmpresa = async (
    convenioRepository,
    empresa_id
) => {

    return await convenioRepository.getByEmpresa(empresa_id);

};