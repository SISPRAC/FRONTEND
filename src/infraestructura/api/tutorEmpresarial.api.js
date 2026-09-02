import axios from "axios";

const tutorEmpresarialApi = axios.create({
  baseURL: "http://localhost:3000/api/tutorEmpresarial",
  withCredentials: true
});

tutorEmpresarialApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getTutorEmpresariales = () => {
  return tutorEmpresarialApi.get("/all");
};

export const invitarTutorEmpresarialRequest = (correo) => {
  return tutorEmpresarialApi.post("/invitacion", {
    correo
  });
};