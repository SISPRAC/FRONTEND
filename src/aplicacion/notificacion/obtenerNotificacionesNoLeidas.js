export const obtenerNotificacionesNoLeidas = async (
    { notificacionRepository }
) => {

    return await notificacionRepository.getNoLeidas();

};