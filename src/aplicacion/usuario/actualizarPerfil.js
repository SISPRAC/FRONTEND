export const actualizarPerfil = async (
    { userRepository },
    datos
) => {

    return await userRepository.actualizarPerfil(datos);

};