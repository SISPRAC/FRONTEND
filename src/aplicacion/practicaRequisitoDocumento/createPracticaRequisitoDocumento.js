export const crearPracticaRequisitoDocumento = async (
    { practicaRequisitoDocumentoRepository },
    data
) => {

    return await practicaRequisitoDocumentoRepository.create(data);

};