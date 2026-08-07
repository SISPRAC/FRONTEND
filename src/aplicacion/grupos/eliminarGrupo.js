export const deleteGrupo = async (
    repos,
    id
) => {

    if (!id) {
        throw new Error("Id requerido");
    }

    return await repos.grupoRepository.delete(id);
};