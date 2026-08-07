import axios from "axios";

const staffApi = axios.create({
  baseURL: "http://localhost:3000/api/staff",
  withCredentials: true
});

// Registro
export const registerStaffRequest = (data, token) => {
  return staffApi.post(`/registerStaff?token=${token}`, data, {
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

export const validarInvitacionRequest = (token) => {
  return staffApi.get(`/verify-invitation?token=${token}`);
};