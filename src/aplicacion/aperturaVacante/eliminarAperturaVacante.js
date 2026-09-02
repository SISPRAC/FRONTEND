export const eliminarAperturaVacante = async (
  aperturaVacanteRepository,
  id
) => {

  return await aperturaVacanteRepository.delete(id);

};