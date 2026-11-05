import {
    getEntregaInformeByPracticanteRequest,
    getTrazabilidadEntregaInformeRequest,
    createEntregaInformeRequest,
    reviewEntregaInformeTutorDocenteRequest,
    reviewEntregaInformeTutorEmpresarialRequest
} from "../api/entregaInforme.api.js";


export const entregaInformeRepository = {


    // =========================================================
    // OBTENER UNA ENTREGA POR ID
    // =========================================================

    async findById(id) {

        const response =
            await getEntregaInformeByIdRequest(
                id
            );

        return response.data;

    },


    // =========================================================
    // OBTENER ENTREGAS DE UN PRACTICANTE POR TIPO DE DOCUMENTO
    // =========================================================

    async findByPracticanteAndTipoRequisito(
        practicante_id,
        tipo_requisito_documento_id
    ) {

        const response =
            await getEntregaInformeByPracticanteRequest(
                practicante_id,
                tipo_requisito_documento_id
            );

        return response.data;

    },


    // =========================================================
    // OBTENER TRAZABILIDAD DE UN INFORME
    // =========================================================

    async findTrazabilidadByPracticanteAndTipoRequisito(
        practicante_id,
        tipo_requisito_documento_id
    ) {

        const response =
            await getTrazabilidadEntregaInformeRequest(
                practicante_id,
                tipo_requisito_documento_id
            );

        return response.data;

    },


    // =========================================================
    // CREAR ENTREGA
    // =========================================================

    async create(data) {

        const response =
            await createEntregaInformeRequest(
                data
            );

        return response.data;

    },


    // =========================================================
    // REVISAR COMO TUTOR DOCENTE
    // =========================================================

    async reviewTutorDocente(
        id,
        data
    ) {

        const response =
            await reviewEntregaInformeTutorDocenteRequest(
                id,
                data
            );

        return response.data;

    },


    // =========================================================
    // REVISAR COMO TUTOR EMPRESARIAL
    // =========================================================

    async reviewTutorEmpresarial(
        id,
        data
    ) {

        const response =
            await reviewEntregaInformeTutorEmpresarialRequest(
                id,
                data
            );

        return response.data;

    }


};