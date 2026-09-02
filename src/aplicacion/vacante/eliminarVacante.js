
export const eliminarVacante = async (
    vacanteRepository,
    id
) => {

    const vacante =
        await vacanteRepository.delete(id);

    return vacante;
};