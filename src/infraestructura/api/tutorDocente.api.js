import axios from "axios";

const tutorDocenteApi = axios.create({
  baseURL: "http://localhost:3000/api/tutorDocente",
  withCredentials: true
});

tutorDocenteApi.interceptors.request.use(
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

export const getTutorDocentes = () => {
  return tutorDocenteApi.get("/all");
};

export const invitarTutorDocenteRequest = (correo) => {
  return tutorDocenteApi.post("/invitacion", {
    correo
  });
};

