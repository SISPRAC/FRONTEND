export const crearVacante = async (
    vacanteRepository,
    data
) => {

    const vacante =
        await vacanteRepository.create(data);

    return vacante;
};