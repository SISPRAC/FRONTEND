export const getGruposByPractica = async ({
    tutorDocenteRepository,
    practicaId
}) => {

    const res = await tutorDocenteRepository.getGruposByPractica(
        practicaId
    );

    return res.data;
};