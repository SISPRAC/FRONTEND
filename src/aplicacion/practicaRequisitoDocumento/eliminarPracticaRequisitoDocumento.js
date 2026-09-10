export const eliminarPracticaRequisitoDocumento = async (
    { practicaRequisitoDocumentoRepository },
    id
) => {

    return await practicaRequisitoDocumentoRepository.delete(id);

};