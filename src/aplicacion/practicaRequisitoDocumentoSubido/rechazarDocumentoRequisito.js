export const rechazarDocumentoRequisito = async ({
    practicaRequisitoDocumentoSubidoRepository,
    id,
    observacion
}) => {

    return await practicaRequisitoDocumentoSubidoRepository.rechazarDocumento(
        id,
        observacion
    );
};