import axios from "axios";

const practicanteApi = axios.create({
  baseURL: "http://localhost:3000/api/practicante",
  withCredentials: true
});

export const getPracticantes = () => {
  return practicanteApi.get("/all");
};