import {
    registerEmpresaRequest,
    invitarEmpresaRequest,
    getMiEmpresaRequest,
    getMisGruposRequest,
    getDetalleGrupoEmpresaRequest,
    actualizarEmpresaRequest,
    getEmpresasParaReportePorPeriodoRequest
} from "../api/empresa.api.js";


export const EmpresaRepository = {

    // =========================================================
    // REGISTRAR EMPRESA
    // =========================================================

    async register(data, token) {

        return await registerEmpresaRequest(
            data,
            token
        );

    },


    // =========================================================
    // INVITAR EMPRESA
    // =========================================================

    async invitar(data) {

        return await invitarEmpresaRequest(
            data
        );

    },


    // =========================================================
    // OBTENER MI EMPRESA
    // =========================================================

    async obtenerMiEmpresa() {

        return await getMiEmpresaRequest();

    },


    // =========================================================
    // OBTENER MIS GRUPOS
    // =========================================================

    async obtenerMisGrupos() {

        return await getMisGruposRequest();

    },


    // =========================================================
    // OBTENER DETALLE DE GRUPO
    // =========================================================

    async obtenerDetalleGrupo(practicaId) {

        return await getDetalleGrupoEmpresaRequest(
            practicaId
        );

    },


    // =========================================================
    // ACTUALIZAR EMPRESA
    // =========================================================

    async actualizar(id, data) {

        return await actualizarEmpresaRequest(
            id,
            data
        );

    },


    // =========================================================
    // OBTENER EMPRESAS PARA REPORTE POR PERÍODO
    // =========================================================

    async obtenerEmpresasParaReportePorPeriodo(periodo_id) {

        return await getEmpresasParaReportePorPeriodoRequest(
            periodo_id
        );

    }

};