export const obtenerRequisitosEmpresaVigentes = async (
    { practicaRequisitoDocumentoRepository }
) => {

    return await practicaRequisitoDocumentoRepository.findRequisitosEmpresaVigentes();

};