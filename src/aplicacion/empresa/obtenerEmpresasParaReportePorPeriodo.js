export const obtenerEmpresasParaReportePorPeriodo = async (
    { empresaRepository },
    periodo_id
) => {
const response = await empresaRepository.obtenerEmpresasParaReportePorPeriodo(
    periodo_id
);
    return response.data;

};