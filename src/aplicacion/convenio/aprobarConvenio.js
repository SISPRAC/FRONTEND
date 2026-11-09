export const aprobarConvenio = async (
    { convenioRepository },
    id,
    formData
) => {
    return await convenioRepository.aprobarConvenio(id, formData);
};