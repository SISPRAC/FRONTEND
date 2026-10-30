export const obtenerGruposParaReportePorPeriodo = async (
    repos,
    periodo_id
) => {

    return await repos.grupoRepository.obtenerGruposParaReportePorPeriodo(
        periodo_id
    );

};