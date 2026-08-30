export const obtenerGruposEmpresa = async (
    EmpresaRepository
) => {
 const res = await EmpresaRepository.obtenerMisGrupos();
    return res.data;

};