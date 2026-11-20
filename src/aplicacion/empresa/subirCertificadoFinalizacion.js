export const subirCertificadoFinalizacion = async (
    EmpresaRepository,
    practicanteId,
    archivo
) => {

    const formData = new FormData();

    // El nombre del campo debe ser "certificado", igual que en upload.single("certificado")
    formData.append("certificado", archivo);

    return await EmpresaRepository.subirCertificadoFinalizacion(
        practicanteId,
        formData
    );

};