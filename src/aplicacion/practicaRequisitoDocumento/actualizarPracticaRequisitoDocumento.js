export const actualizarPracticaRequisitoDocumento = async (
    { practicaRequisitoDocumentoRepository },
    id,
    data
) => {

    return await practicaRequisitoDocumentoRepository.update(
        id,
        data
    );

};