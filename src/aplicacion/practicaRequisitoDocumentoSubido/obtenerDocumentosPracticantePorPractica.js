
export const obtenerDocumentosPracticantePorPractica = async ({
    practicaRequisitoDocumentoSubidoRepository,
    usuario_id,
    practica_id
}) => {

    const res =
        await practicaRequisitoDocumentoSubidoRepository.getDocumentosPracticantePorPractica(
            usuario_id,
            practica_id
        );

    return res;
};
