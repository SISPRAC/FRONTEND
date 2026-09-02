import {
    registerEmpresaRequest,
    invitarEmpresaRequest,
    getMiEmpresaRequest,
    getMisGruposRequest,
    getDetalleGrupoEmpresaRequest,
    actualizarEmpresaRequest
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

    }

};