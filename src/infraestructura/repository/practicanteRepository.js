import {
  getPracticantes,
  obtenerMiPractica,
  obtenerPracticantesPorPractica
} from "../api/practicante.api.js";

export const practicanteRepository = {

  async getAll() {

    const response = await getPracticantes();

    return response.data;

  },

  async obtenerMiPractica() {

    const response = await obtenerMiPractica();

    return response.data;

  },

  async obtenerPracticantesPorPractica(practicaId) {

    const response =
      await obtenerPracticantesPorPractica(practicaId);

    return response.data;

  }

};

