export const obtenerTiposRequisitoDocumentoPorRol = async (
    { tipoRequisitoDocumentoRepository },
    rol_id
) => {

    return await tipoRequisitoDocumentoRepository.findByRol(
        rol_id
    );

};