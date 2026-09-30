import {
    crearSolicitudVisitaRequest,
    obtenerSolicitudesVisitaTutorDocenteRequest,
    obtenerSolicitudesVisitaPorPracticaRequest,
    editarSolicitudVisitaRequest,
    cancelarSolicitudVisitaRequest,
    crearVisitaRequest,
    rechazarSolicitudVisitaRequest
} from "../api/solicitudVisita.api.js";


export const solicitudVisitaRepository = {

    // ============================================================
    // CREAR SOLICITUD
    // ============================================================

    async crear(data) {

        const response =
            await crearSolicitudVisitaRequest(
                data
            );

        return response.data;
    },


    // ============================================================
    // OBTENER MIS SOLICITUDES
    // ============================================================

    async getMisSolicitudes() {

        const response =
            await obtenerSolicitudesVisitaTutorDocenteRequest();

        return response.data;
    },


    // ============================================================
    // OBTENER SOLICITUDES POR PRÁCTICA
    // TUTOR EMPRESARIAL
    // ============================================================

    async getSolicitudesPorPractica(practicaId) {

        const response =
            await obtenerSolicitudesVisitaPorPracticaRequest(
                practicaId
            );

        return response.data;
    },


    // ============================================================
    // EDITAR SOLICITUD
    // ============================================================

    async editar(id, data) {

        const response =
            await editarSolicitudVisitaRequest(
                id,
                data
            );

        return response.data;
    },


    // ============================================================
    // CANCELAR SOLICITUD
    // ============================================================

    async cancelar(id, motivo) {

        const response =
            await cancelarSolicitudVisitaRequest(
                id,
                motivo
            );

        return response.data;
    },


    // ============================================================
    // ACEPTAR SOLICITUD Y CREAR VISITA
    // ============================================================

    async crearVisita(data) {

        const response =
            await crearVisitaRequest(
                data
            );

        return response.data;
    },


    // ============================================================
    // RECHAZAR SOLICITUD
    // ============================================================

    async rechazar(data) {

        const response =
            await rechazarSolicitudVisitaRequest(
                data
            );

        return response.data;
    }

};

