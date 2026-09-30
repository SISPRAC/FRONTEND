export const obtenerNotificaciones = async (
    { notificacionRepository }
) => {

    return await notificacionRepository.getAll();

};