
export const editarPracticaRequisitoDocumento = async ({
    practicaRequisitoDocumentoSubidoRepository,
    formData
}) => {

    return await practicaRequisitoDocumentoSubidoRepository.editarDocumento(
        formData
    );
};
