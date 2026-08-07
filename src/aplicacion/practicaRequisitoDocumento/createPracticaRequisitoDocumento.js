export const createPracticaRequisitoDocumento = async (
    practicaRequisitoDocumentoRepository,
    data
) => {
    return await practicaRequisitoDocumentoRepository.create(data);
};