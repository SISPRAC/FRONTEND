export const obtenerPracticaRequisitoDocumento = async (
    { practicaRequisitoDocumentoRepository },
    id
) => {

    return await practicaRequisitoDocumentoRepository.findById(id);

};