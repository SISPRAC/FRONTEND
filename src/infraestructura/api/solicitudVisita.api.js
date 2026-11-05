import axios from "axios";

const solicitudVisitaApi = axios.create({
    baseURL: "http://localhost:3000/api/solicitudVisita",
    withCredentials: true
});


const getToken = () => {
    return localStorage.getItem("token");
};


// ============================================================
// CREAR SOLICITUD
// ============================================================

export const crearSolicitudVisitaRequest = async (data) => {

    return await solicitudVisitaApi.post(
        "/",
        data,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );

};


// ============================================================
// OBTENER MIS SOLICITUDES
// ============================================================

export const obtenerSolicitudesVisitaTutorDocenteRequest =
    async () => {

        return await solicitudVisitaApi.get(
            "/mis-solicitudes",
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };


// ============================================================
// OBTENER SOLICITUD PARA GESTIONAR
// TUTOR DOCENTE AUTENTICADO
// ============================================================

export const obtenerSolicitudParaGestionarRequest =
    async (id) => {

        return await solicitudVisitaApi.get(
            `/${id}/gestionar`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };


// ============================================================
// OBTENER SOLICITUDES POR PRÁCTICA
// TUTOR EMPRESARIAL
// ============================================================

export const obtenerSolicitudesVisitaPorPracticaRequest =
    async (practicaId) => {

        return await solicitudVisitaApi.get(
            `/practica/${practicaId}`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };


// ============================================================
// EDITAR SOLICITUD
// ============================================================

export const editarSolicitudVisitaRequest =
    async (id, data) => {

        return await solicitudVisitaApi.put(
            `/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };


// ============================================================
// CANCELAR SOLICITUD
// ============================================================

export const cancelarSolicitudVisitaRequest =
    async (id, motivo) => {

        return await solicitudVisitaApi.put(
            `/${id}/cancelar`,
            {
                motivo
            },
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };


// ============================================================
// ACEPTAR SOLICITUD Y CREAR VISITA
// ============================================================

export const crearVisitaRequest =
    async (data) => {

        return await solicitudVisitaApi.post(
            "/crear-visita",
            data,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };


// ============================================================
// RECHAZAR SOLICITUD DE VISITA
// ============================================================

export const rechazarSolicitudVisitaRequest =
    async (data) => {

        return await solicitudVisitaApi.put(
            "/rechazar",
            data,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );

    };