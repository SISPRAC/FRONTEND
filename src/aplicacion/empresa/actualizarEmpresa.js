export const actualizarEmpresa = async (
    EmpresaRepository,
    id,
    data
) => {

    if (!id) {
        throw new Error("El ID de la empresa es obligatorio");
    }

    if (!data) {
        throw new Error(
            "Los datos de la empresa son obligatorios"
        );
    }

    return await EmpresaRepository.actualizar(
        id,
        data
    );
};