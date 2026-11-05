import {
    getTutorDocentes,
    invitarTutorDocenteRequest,
    getGruposByPracticaRequest,
    getPracticantesGrupoRequest
} from "../api/tutorDocente.api";


export const tutorDocenteRepository = {

    async getAll() {
        return await getTutorDocentes();
    },

    async invitar(correo) {
        return await invitarTutorDocenteRequest(correo);
    },

    async getGruposByPractica( practicaId) {
        return await getGruposByPracticaRequest(
            practicaId
        );
    },

    async getPracticantesGrupo(grupoId, practicaId) {
        return await getPracticantesGrupoRequest(
            grupoId,
            practicaId
        );
    }

};