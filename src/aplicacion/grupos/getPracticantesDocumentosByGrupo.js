export const getPracticantesDocumentosByGrupo = async (
    { grupoRepository },
    grupoId
) => {
    return await grupoRepository.getPracticantesDocumentosByGrupoId(
        grupoId
    );
};