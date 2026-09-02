
export const getVacanteById = async (
    vacanteRepository,
    id
) => {

    const vacante =
        await vacanteRepository.getById(id);

    return vacante;
};