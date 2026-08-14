export const getAperturasVacantes = async (
    aperturaVacanteRepository
) => {

    const response =
        await aperturaVacanteRepository.getAll();

    return response;
};