export const getPracticantesGrupo = async ({
    tutorDocenteRepository,
    grupoId,
    practicaId
}) => {

    const res = await tutorDocenteRepository.getPracticantesGrupo(
        grupoId,
        practicaId
    );

    return res.data;
};