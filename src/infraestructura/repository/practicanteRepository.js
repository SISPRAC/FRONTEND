import {getPracticantes} from "../api/practicante.api.js"

export const practicanteRepository = {
  async getAll() {
     const response = await  getPracticantes();
    return response.data;
  }
};
