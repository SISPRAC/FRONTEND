export const getIdiomas = async ({ idiomaRepository }) => {

    return await idiomaRepository.getAll();

};