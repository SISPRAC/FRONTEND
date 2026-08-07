// registerService.js
import { registerCandidatoRequest } from "../../infraestructura/api/candidato.api";

import { registerStaffRequest } from "../../infraestructura/api/staff.api";

export const registerCandidatoService = async (data) => {
  if (!data.get("correo")) {
    throw new Error("Correo requerido");
  }

  return await registerCandidatoRequest(data); // ✅ usa la capa infraestructura
};



export const registerStaffService = async (data, token) => {
  if (!data.get("correo")) {
    throw new Error("Correo requerido");
  }

  return await registerStaffRequest(data, token); // ✅ usa la capa infraestructura
};