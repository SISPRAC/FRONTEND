
export const obtenerPracticaRequisitoDocumentoSubido = async ({
    practicaRequisitoDocumentoSubidoRepository,
    documentoId
}) => {

    const res =
        await practicaRequisitoDocumentoSubidoRepository.getById(
            documentoId
        );

    return res;
};
