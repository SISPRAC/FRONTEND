
export const obtenerMisDocumentosRequisitos = async ({
    practicaRequisitoDocumentoSubidoRepository
}) => {

    const res =
        await practicaRequisitoDocumentoSubidoRepository.getMisDocumentos();

    return res;
};
