export const cambiarEstadoUsuario = async ({
    userRepository
}, id, estado) => {

    return await userRepository.cambiarEstado(
        id,
        estado
    );

};

