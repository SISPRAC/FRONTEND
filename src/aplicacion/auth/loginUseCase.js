import { loginRequest } from "../../infraestructura/api/auth.api";

export const loginUseCase = async (data) => {
  const res = await loginRequest(data);
  return res.data;
};