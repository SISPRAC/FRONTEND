import {
    getEncuestasRequest,
    createEncuestaRequest,
    getEncuestaRequest,
    editarEncuestaRequest,
    asignarEncuestaPracticaRequest,
    deleteEncuestaRequest
} from "../api/encuesta.api.js";

export const encuestaRepository = {

    // =============================
    // CREAR ENCUESTA COMPLETA
    // =============================

    async create(data) {

        const response =
            await createEncuestaRequest(data);

        return response.data;

    },


    // =============================
    // OBTENER TODAS
    // =============================

    async getAll() {

        const response =
            await getEncuestasRequest();

        return response.data;

    },


    // =============================
    // OBTENER UNA POR ID
    // =============================

    async getById(id) {

        const response =
            await getEncuestaRequest(id);

        return response.data;

    },


    // =============================
    // EDITAR ENCUESTA
    // =============================
    // Actualiza:
    // - Título
    // - Descripción
    // - Preguntas
    // - Opciones

    async editarEncuesta(id, data) {

        const response =
            await editarEncuestaRequest(
                id,
                data
            );

        return response.data;

    },


    // =============================
    // ASIGNAR ENCUESTA A PRÁCTICA
    // =============================

    async asignarEncuestaPractica(data) {

        const response =
            await asignarEncuestaPracticaRequest(data);

        return response.data;

    },


    // =============================
    // ELIMINAR
    // =============================

    async delete(id) {

        const response =
            await deleteEncuestaRequest(id);

        return response.data;

    }

};