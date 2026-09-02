export const obtenerDetalleGrupoEmpresa = async (
    EmpresaRepository,
    practicaId
) => {

    const res = await EmpresaRepository.obtenerDetalleGrupo(
        practicaId
    )

    return res.data;

};