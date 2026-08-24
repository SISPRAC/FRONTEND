import {getTutorDocentes } from "../api/tutorDocente.api"

export const tutorDocenteRepository = {
  async getAll() {
    return await getTutorDocentes();
  }
}; 
