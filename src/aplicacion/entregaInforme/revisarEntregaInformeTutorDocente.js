export const revisarEntregaInformeTutorDocente = async (
    { entregaInformeRepository },
    id,
    data
) => {

    return await entregaInformeRepository.reviewTutorDocente(
        id,
        data
    );

};