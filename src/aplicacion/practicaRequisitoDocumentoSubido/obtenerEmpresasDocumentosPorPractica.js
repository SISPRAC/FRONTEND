export const obtenerEmpresasDocumentosPorPractica = async ({
    practicaRequisitoDocumentoSubidoRepository,
    practica_id
}) => {

    const res =
        await practicaRequisitoDocumentoSubidoRepository.getEmpresasDocumentosPorPractica(
            practica_id
        );

    return res;
};