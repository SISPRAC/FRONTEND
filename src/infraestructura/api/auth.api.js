
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const authApi = axios.create({
  baseURL: `${BASE_URL}/auth`,
  withCredentials: true,
});

export const loginRequest = (data) =>
  authApi.post("/login", data);

export const refreshRequest = () =>
  authApi.get("/refresh");

export const logoutRequest = () =>
  authApi.post("/logout");

// Recuperación de contraseña
export const forgotPasswordRequest = (data) =>
  authApi.post("/forgot-password", data);

export const resetPasswordRequest = (data) =>
  authApi.post("/reset-password", data);

// Google Login
export const googleLoginRequest = (data) =>
  authApi.post("/google", data);

export default authApi;
