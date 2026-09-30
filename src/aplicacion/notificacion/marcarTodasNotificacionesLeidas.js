export const marcarTodasNotificacionesLeidas = async (
    { notificacionRepository }
) => {

    return await notificacionRepository.marcarTodasComoLeidas();

};