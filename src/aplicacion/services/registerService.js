import { registerStaffRequest } from "../../infraestructura/api/staff.api";


export const registerStaffService = async (data, token) => {

  if (!token) {
    throw new Error("Token de invitación requerido");
  }

  return await registerStaffRequest(data, token);
};