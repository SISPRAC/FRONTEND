import axios from "axios";
import { refreshRequest } from "./auth.api.js";

const BASE_URL = "http://localhost:3000/api";

// Compartido entre TODAS las instancias: si varias peticiones fallan
// a la vez (aunque sean de módulos distintos), solo se hace un refresh.
let refreshPromise = null;

export const createApi = (path = "") => {
  const instance = axios.create({
    baseURL: `${BASE_URL}${path}`,
    withCredentials: true
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
        console.log("INTERCEPTOR:", error.response?.status, error.config?.url);   // log 1
      const original = error.config;

      // Sin sesión guardada (ej. rutas públicas), no hay nada que renovar
      const hayToken = !!localStorage.getItem("token");

      if (error.response?.status !== 401 || original._retry || !hayToken) {
        return Promise.reject(error);
      }
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = refreshRequest().finally(() => {
            refreshPromise = null;
          });
        }

        const { data } = await refreshPromise;

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return instance(original);

      } catch (refreshError) {
         console.log("REFRESH FALLÓ, lanzando evento", refreshError);            // log 2
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("rolActivo");

        window.dispatchEvent(new Event("session-expired"));
        return Promise.reject(refreshError);
      }
    }
  );

  return instance;
};