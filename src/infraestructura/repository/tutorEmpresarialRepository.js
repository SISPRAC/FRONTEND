import {
  getTutorEmpresariales,
  invitarTutorEmpresarialRequest
} from "../api/tutorEmpresarial.api";

export const tutorEmpresarialRepository = {

  async getAll() {
    const { data } = await getTutorEmpresariales();
    return data;
  },

  async invitar(correo) {
    const { data } = await invitarTutorEmpresarialRequest(correo);
    return data;
  }

};