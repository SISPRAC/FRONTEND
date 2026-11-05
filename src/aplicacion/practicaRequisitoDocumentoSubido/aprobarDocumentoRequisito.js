export const aprobarDocumentoRequisito = async ({
    practicaRequisitoDocumentoSubidoRepository,
    id
}) => {

    return await practicaRequisitoDocumentoSubidoRepository.aprobarDocumento(
        id
    );
};