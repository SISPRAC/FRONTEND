export const obtenerRequisitosPracticanteVigentes = async (
    { practicaRequisitoDocumentoRepository }
) => {

    return await practicaRequisitoDocumentoRepository.findRequisitosPracticanteVigentes();

};