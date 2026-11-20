import { createApi } from "./createApi.js";

const staffApi  = createApi("/staff");

// Registro
export const registerStaffRequest = (data, token) => {
  return staffApi.post(`/registerStaff?token=${encodeURIComponent(token)}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// Invitaciones
export const generarInvitacionTutorEmpresarial = () => {
  return staffApi.get("/invitacionTokenTutorEmpresarial");
};

export const generarInvitacionTutorDocente = () => {
  return staffApi.get("/invitacionTokenTutorDocente");
};

// Validar invitación
export const validarInvitacionRequest = (token) => {
  return staffApi.get(
    `http://localhost:3000/api/invitacion/validar?token=${encodeURIComponent(token)}`
  );
};