export const getPracticaRequisitoDocumento = async (
    practicaRequisitoDocumentoRepository,
    id
) => {
    return await practicaRequisitoDocumentoRepository.findById(id);
};