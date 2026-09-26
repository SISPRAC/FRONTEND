export const obtenerInformesPracticanteVigentes = async (
    { practicaRequisitoDocumentoRepository }
) => {

    return await practicaRequisitoDocumentoRepository.findInformesPracticanteVigentes();

};