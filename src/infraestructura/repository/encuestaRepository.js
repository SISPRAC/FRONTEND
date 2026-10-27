
import {
    getEncuestasRequest,
    createEncuestaRequest,
    getEncuestaRequest,
    editarEncuestaRequest,
    asignarEncuestaPracticaRequest,
    deleteEncuestaRequest,
    obtenerEncuestasPracticanteRequest,
    obtenerEncuestasEvaluacionPracticanteRequest,
    responderEncuestaEvaluacionPracticanteRequest,
    responderEncuestaPracticanteRequest,
    obtenerRespuestasEncuestasPracticanteRequest
} from "../api/encuesta.api.js";


export const encuestaRepository = {

    // =============================
    // CREAR ENCUESTA COMPLETA
    // =============================

    async create(data) {
        const response = await createEncuestaRequest(data);
        return response.data;
    },


    // =============================
    // OBTENER TODAS
    // =============================

    async getAll() {
        const response = await getEncuestasRequest();
        return response.data;
    },


    // =============================
    // OBTENER UNA POR ID
    // =============================

    async getById(id) {
        const response = await getEncuestaRequest(id);
        return response.data;
    },


    // =============================
    // EDITAR ENCUESTA
    // =============================

    async editarEncuesta(id, data) {
        const response = await editarEncuestaRequest(id, data);
        return response.data;
    },


    // =============================
    // ASIGNAR ENCUESTA A PRÁCTICA
    // =============================

    async asignarEncuestaPractica(data) {
        const response = await asignarEncuestaPracticaRequest(data);
        return response.data;
    },


    // =============================
    // ELIMINAR
    // =============================

    async delete(id) {
        const response = await deleteEncuestaRequest(id);
        return response.data;
    },


    // =============================
    // OBTENER ENCUESTAS DEL PRACTICANTE
    // =============================

    async obtenerEncuestasPracticante() {
        const response = await obtenerEncuestasPracticanteRequest();
        return response.data;
    },


    // =============================
    // OBTENER ENCUESTAS Y RESPUESTAS DEL PRACTICANTE
    // Solo Director de Programa
    // =============================

    async obtenerRespuestasEncuestasPracticante(practicante_id) {
        const response =
            await obtenerRespuestasEncuestasPracticanteRequest(
                practicante_id
            );

        return response.data;
    },


    // =============================
    // OBTENER ENCUESTAS PARA EVALUAR
    // =============================

    async obtenerEncuestasEvaluacionPracticante(
        practicante_id,
        rolEvaluador
    ) {
        const response =
            await obtenerEncuestasEvaluacionPracticanteRequest(
                practicante_id,
                rolEvaluador
            );

        return response.data;
    },


    // =============================
    // RESPONDER ENCUESTA DE EVALUACIÓN
    // Tutor Docente, Tutor Empresarial o Empresa
    // =============================

    async responderEncuestaEvaluacionPracticante(data) {
        const response =
            await responderEncuestaEvaluacionPracticanteRequest(data);

        return response.data;
    },


    // =============================
    // RESPONDER ENCUESTA DEL PRACTICANTE
    // =============================

    async responderEncuestaPracticante(data) {
        const response = await responderEncuestaPracticanteRequest(data);
        return response.data;
    }

};
