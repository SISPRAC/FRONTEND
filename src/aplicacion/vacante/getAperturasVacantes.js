export const getAperturasVacantes = async (
    vacanteRepository
) => {

    const aperturas =
        await vacanteRepository.getAperturas();

    return aperturas;
};