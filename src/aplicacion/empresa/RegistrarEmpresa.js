export const registerEmpresa = async (
    { EmpresaRepository },
    data,
    token
) => {

    return await EmpresaRepository.register(
        data,
        token
    );

};