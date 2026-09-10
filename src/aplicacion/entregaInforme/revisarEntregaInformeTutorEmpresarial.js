export const revisarEntregaInformeTutorEmpresarial = async (
    { entregaInformeRepository },
    id,
    data
) => {

    return await entregaInformeRepository.reviewTutorEmpresarial(
        id,
        data
    );

};