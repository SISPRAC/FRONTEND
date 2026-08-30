import {
    registerEmpresaRequest,
    getMiEmpresaRequest,
    getMisGruposRequest,
    getDetalleGrupoEmpresaRequest,
    actualizarEmpresaRequest
} from "../api/empresa.api.js";


export const EmpresaRepository = {

    async register(data) {

        return await registerEmpresaRequest(data);
    },


    async obtenerMiEmpresa() {

        return await getMiEmpresaRequest();
    },


    async obtenerMisGrupos() {

        return await getMisGruposRequest();
    },


    async obtenerDetalleGrupo(practicaId) {

        return await getDetalleGrupoEmpresaRequest(
            practicaId
        );
    },


    async actualizar(id, data) {

        return await actualizarEmpresaRequest(
            id,
            data
        );
    }

};