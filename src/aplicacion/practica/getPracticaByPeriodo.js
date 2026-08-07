export const getPracticaByPeriodo = async (
    { practicaRepository },
    periodo_id
) => {

    return await practicaRepository.getPracticaByPeriodo(periodo_id);

};