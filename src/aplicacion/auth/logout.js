import { logoutRequest } from "../../infraestructura/api/auth.api";

export const logoutUseCase = async () => {
  const res = await logoutRequest();
  return res.data;
};