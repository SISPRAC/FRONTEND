export const obtenerCertificadoFinalizacion = async (
    EmpresaRepository,
    practicanteId
) => {

    return await EmpresaRepository.obtenerCertificadoFinalizacion(
        practicanteId
    );

};