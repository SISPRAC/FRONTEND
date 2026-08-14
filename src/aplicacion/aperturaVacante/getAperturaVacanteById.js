
export const getAperturaVacanteById = async (
  aperturaVacanteRepository,
  id
) => {

  const response =
    await aperturaVacanteRepository.getById(id);


  return response.data;
};