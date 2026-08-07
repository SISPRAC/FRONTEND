import axios from "axios";

const tutorDocenteApi = axios.create({
  baseURL: "http://localhost:3000/api/tutorDocente",
  withCredentials: true
});

export const getTutorDocentes = () => {
  return tutorDocenteApi.get("/all");
};