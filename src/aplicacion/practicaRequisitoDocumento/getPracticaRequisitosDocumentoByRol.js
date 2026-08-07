export const getPracticaRequisitosDocumentoByRol = async (
    practicaRequisitoDocumentoRepository,
    practica_id,
    rol_id
) => {
    return await practicaRequisitoDocumentoRepository.findByPracticaAndRol(
        practica_id,
        rol_id
    );
};