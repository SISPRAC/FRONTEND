import axios from "axios";


const periodoApi = axios.create({

    baseURL: "http://localhost:3000/api/periodo",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
periodoApi.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");


        if(token){

            config.headers.Authorization = 
            `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


export const getPeriodosRequest = () => periodoApi.get("/all");

export const createPeriodoRequest = async (data) => {
  return await periodoApi.post("/crear", data);
};

export const deletePeriodoRequest = async (id) => {
  return await periodoApi.delete(`/${id}`);
};

export const updatePeriodoRequest = async (
  id,
  data
) => {
  return await periodoApi.put(`/${id}`, data);
};

export const getPeriodoByIdRequest = async (id) => {
  return await periodoApi.get(`/${id}`);
};