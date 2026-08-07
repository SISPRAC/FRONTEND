export const deletePracticaRequisitoDocumento = async (
    practicaRequisitoDocumentoRepository,
    id
) => {
    return await practicaRequisitoDocumentoRepository.delete(id);
};