import {
    getPracticaRequisitosDocumentoRequest,
    getPracticaRequisitosDocumentoByRolRequest,
    getRequisitosPracticanteVigentesRequest,
    getInformesPracticanteVigentesRequest,
    createPracticaRequisitoDocumentoRequest,
    deletePracticaRequisitoDocumentoRequest,
    updatePracticaRequisitoDocumentoRequest
} from "../api/practicaRequisitoDocumento.api.js";


export const practicaRequisitoDocumentoRepository = {

    // ============================================================
    // REQUISITOS DE UNA PRÁCTICA
    // ============================================================

    async findByPracticaId(practica_id) {

        const response =
            await getPracticaRequisitosDocumentoRequest(
                practica_id
            );

        return response.data;

    },


    // ============================================================
    // REQUISITOS DE UNA PRÁCTICA POR ROL
    // ============================================================

    async findByPracticaAndRol(
        practica_id,
        rol_id
    ) {

        const response =
            await getPracticaRequisitosDocumentoByRolRequest(
                practica_id,
                rol_id
            );

        return response.data;

    },


    // ============================================================
    // REQUISITOS VIGENTES DEL PRACTICANTE
    // ============================================================

    async findRequisitosPracticanteVigentes() {

        const response =
            await getRequisitosPracticanteVigentesRequest();

        return response.data;

    },


    // ============================================================
    // INFORMES VIGENTES DEL PRACTICANTE
    // ============================================================

    async findInformesPracticanteVigentes() {

        const response =
            await getInformesPracticanteVigentesRequest();

        return response.data;

    },


    // ============================================================
    // CREAR
    // ============================================================

    async create(data) {

        const response =
            await createPracticaRequisitoDocumentoRequest(
                data
            );

        return response.data;

    },


    // ============================================================
    // ELIMINAR
    // ============================================================

    async delete(id) {

        const response =
            await deletePracticaRequisitoDocumentoRequest(
                id
            );

        return response.data;

    },

    // ============================================================
    // ACTUALIZAR
    // ============================================================

    async update(id, data) {

        const response =
            await updatePracticaRequisitoDocumentoRequest(
                id,
                data
            );

        return response.data;

    }

};