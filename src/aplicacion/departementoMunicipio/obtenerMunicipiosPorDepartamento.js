export const obtenerMunicipiosPorDepartamento = async (
    departamentoMunicipioRepository,
    departamentoId
) => {

    return await departamentoMunicipioRepository.getMunicipiosPorDepartamento(
        departamentoId
    );

};