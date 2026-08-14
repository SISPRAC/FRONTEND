export const crearAperturaVacante = async (
  aperturaVacanteRepository,
  data
) => {

  return await aperturaVacanteRepository.create(data);

};