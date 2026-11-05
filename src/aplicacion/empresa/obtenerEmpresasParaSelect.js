export const obtenerEmpresasParaSelect = async (
    { EmpresaRepository },
    convenio = "activo"
) => {

    const res = await EmpresaRepository.obtenerEmpresasParaSelect(
        convenio
    );

    return res.data;
};