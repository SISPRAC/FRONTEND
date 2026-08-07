import {registerEmpresaRequest} from "../api/empresa.api.js";

export const EmpresaRepository = {
  async register(data) {
    return await registerEmpresaRequest(data);
  },
};
