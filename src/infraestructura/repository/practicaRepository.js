import {
  getPracticasRequest,
  getPracticaByIdRequest,
  getPracticaByPeriodoRequest,
  createPracticaRequest,
  updatePracticaRequest,
  deletePracticaRequest
} from "../api/practica.api";

export const practicaRepository = {
  getPracticas: async () => {
    const { data } = await getPracticasRequest();
    return data;
  },

  getPracticaById: async (id) => {
    const { data } = await getPracticaByIdRequest(id);
    return data;
  },

  getPracticaByPeriodo: async (periodo_id) => {
    const { data } = await getPracticaByPeriodoRequest(periodo_id);
    return data;
  },

  createPractica: async (practica) => {
    const { data } = await createPracticaRequest(practica);
    return data;
  },

  updatePractica: async (id, practica) => {
    const { data } = await updatePracticaRequest(id, practica);
    return data;
  },

  deletePractica: async (id) => {
    const { data } = await deletePracticaRequest(id);
    return data;
  }
};