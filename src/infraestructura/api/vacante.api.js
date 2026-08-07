import axios from "axios";

const vacanteApi = axios.create({
  baseURL: "http://localhost:3000/api/vacante",
  withCredentials: true
});

export const getVacantesRequest = () => vacanteApi.get("/all");

