export const registrarHistorialConvenio = async (
  {historialConvenioRepository},
  data
) => {

  return await historialConvenioRepository.registrar(data);
};