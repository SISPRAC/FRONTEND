export const obtenerRequisitosDocumentosPracticante = async (
    { practicanteRepository },
    practicanteId
) => {

    return await practicanteRepository.obtenerRequisitosDocumentosPracticante(
        practicanteId
    );

};