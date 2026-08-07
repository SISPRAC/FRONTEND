export const actualizarEstadoConvenio = async (
  {convenioRepository},
  id,
  data
) => {

  return await convenioRepository.actualizarEstadoConvenio(id,data);
};