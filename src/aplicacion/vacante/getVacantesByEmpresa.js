export const getVacantesByEmpresa = async (
    vacanteRepository
) => {

    const vacantes =
        await vacanteRepository.getByEmpresa();

    return vacantes.data;
};