export const getGruposByPracticaId = async ({ grupoRepository }, practica_id) => {
    return await grupoRepository.getGruposByPracticaId(practica_id);
};