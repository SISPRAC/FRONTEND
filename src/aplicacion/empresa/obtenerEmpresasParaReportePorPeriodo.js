export const obtenerEmpresasParaReportePorPeriodo = async (
    { empresaRepository },
    periodo_id
) => {

    return await empresaRepository.obtenerEmpresasParaReportePorPeriodo(
        periodo_id
    );

};