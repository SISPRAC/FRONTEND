export const createPeriodo = async (
  repos,
  data
) => {

  if (!data.nombre) {
    throw new Error("Nombre requerido");
  }

  return await repos.periodoRepository.create(data);
};