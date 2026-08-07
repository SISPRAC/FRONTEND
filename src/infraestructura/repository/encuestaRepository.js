import {
    getEncuestasRequest,
    createEncuestaRequest,
    getEncuestaRequest,
    editarEncuestaRequest,
    editarPeriodoPlantillaRequest,
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
    // EDITAR PLANTILLA
    // =============================
    // Titulo
    // Descripcion
    // Rol

    async editarEncuesta(id, data) {

        const response =
            await editarEncuestaRequest(
                id,
                data
            );

        return response.data;

    },


    // =============================
    // EDITAR PERIODO / VERSION
    // =============================
    // Version
    // Preguntas
    // Opciones

    async editarPeriodoPlantilla(id, data) {

        const response =
            await editarPeriodoPlantillaRequest(
                id,
                data
            );

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