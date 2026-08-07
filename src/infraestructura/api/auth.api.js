import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:3000/api/auth",
  withCredentials: true
});

export const loginRequest = (data) => authApi.post("/login", data);
export const refreshRequest = () => authApi.get("/refresh");
export const logoutRequest = () => authApi.post("/logout");

export default authApi;