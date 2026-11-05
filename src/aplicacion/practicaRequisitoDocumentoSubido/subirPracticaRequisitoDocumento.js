
export const subirPracticaRequisitoDocumento = async ({
    practicaRequisitoDocumentoSubidoRepository,
    formData
}) => {

    const res =
        await practicaRequisitoDocumentoSubidoRepository.subirDocumento(
            formData
        );

    return res;
};
