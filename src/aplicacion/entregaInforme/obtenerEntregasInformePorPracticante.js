export const obtenerEntregasInformePorPracticante = async (
    { entregaInformeRepository },
    practicante_id,
    tipo_requisito_documento_id
) => {

    return await entregaInformeRepository.findByPracticanteAndTipoRequisito(
        practicante_id,
        tipo_requisito_documento_id
    );

};