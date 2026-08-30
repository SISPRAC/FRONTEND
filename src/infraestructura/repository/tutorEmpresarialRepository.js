import { getTutorEmpresariales } from "../api/tutorEmpresarial.api";

export const tutorEmpresarialRepository = {

  async getAll() {

    return await getTutorEmpresariales();

  }

};