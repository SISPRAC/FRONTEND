export const updatePracticaRequisitoDocumento = async (
    practicaRequisitoDocumentoRepository,
    id,
    data
) => {
    return await practicaRequisitoDocumentoRepository.update(id, data);
};