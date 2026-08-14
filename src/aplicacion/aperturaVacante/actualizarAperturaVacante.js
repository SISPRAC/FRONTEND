export const actualizarAperturaVacante = async (
  aperturaVacanteRepository,
  id,
  data
) => {

  return await aperturaVacanteRepository.update(
    id,
    data
  );

};