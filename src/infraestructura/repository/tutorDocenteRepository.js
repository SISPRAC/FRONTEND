import {
  getTutorDocentes,
  invitarTutorDocenteRequest
} from "../api/tutorDocente.api";

export const tutorDocenteRepository = {

  async getAll() {
    return await getTutorDocentes();
  },

  async invitar(correo) {
    return await invitarTutorDocenteRequest(correo);
  }

};

