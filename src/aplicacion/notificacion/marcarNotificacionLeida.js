export const marcarNotificacionLeida = async (
    { notificacionRepository },
    id
) => {

    if (!id) {
        throw new Error(
            "El id de la notificación es obligatorio"
        );
    }

    return await notificacionRepository.marcarComoLeida(
        id
    );

};