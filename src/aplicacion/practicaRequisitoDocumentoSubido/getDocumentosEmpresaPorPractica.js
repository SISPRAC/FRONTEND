export const getDocumentosEmpresaPorPractica = async ({
    practicaRequisitoDocumentoSubidoRepository,
    usuario_id,
    practica_id
}) => {

    const res =
        await practicaRequisitoDocumentoSubidoRepository.getDocumentosEmpresaPorPractica(
            usuario_id,
            practica_id
        );

    return res;
};