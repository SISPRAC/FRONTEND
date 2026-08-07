import { validarInvitacionRequest } from "../../infraestructura/api/staff.api";

export const validarInvitacionService = async (token) => {
  if (!token) {
    throw new Error("Token requerido");
  }

  return await validarInvitacionRequest(token);
};