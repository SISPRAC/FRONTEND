export const invitarEmpresa = async (
    { empresaRepository },
    data
) => {

    return await empresaRepository.invitar(data);

};