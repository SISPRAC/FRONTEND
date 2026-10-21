import {
    getPracticaRequisitosDocumentoRequest,
    getPracticaRequisitosDocumentoByRolRequest,
    getRequisitosPracticanteVigentesRequest,
    getInformesPracticanteVigentesRequest,
    getRequisitosEmpresaVigentesRequest,
    createPracticaRequisitoDocumentoRequest,
    deletePracticaRequisitoDocumentoRequest,
    updatePracticaRequisitoDocumentoRequest,
    getPracticaRequisitoDocumentoByIdRequest
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
    // REQUISITOS VIGENTES DE LA EMPRESA
    // ============================================================

    async findRequisitosEmpresaVigentes() {

        const response =
            await getRequisitosEmpresaVigentesRequest();

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
    // OBTENER REQUISITO DOCUMENTAL POR ID
    // ============================================================

    async findById(id) {

        const response =
            await getPracticaRequisitoDocumentoByIdRequest(id);

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