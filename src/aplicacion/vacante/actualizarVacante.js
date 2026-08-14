
export const actualizarVacante = async (
    vacanteRepository,
    id,
    data
) => {

    const vacante =
        await vacanteRepository.getById(id);

    return await vacanteRepository.update(
        id,
        data
    );
};