import axios from "axios";

const retiroPracticanteApi = axios.create({

    baseURL: "http://localhost:3000/api/retiroPracticante",

    withCredentials: true

});


retiroPracticanteApi.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("token");


        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }


        return config;

    },

    (error) => {

        return Promise.reject(error);

    }

);


export const crearRetiroPracticanteRequest = (data) => {

    return retiroPracticanteApi.post(
        "/",
        data
    );

};


export const getRetirosRequest = () => {

    return retiroPracticanteApi.get("/");

};


export const getRetiroRequest = (id) => {

    return retiroPracticanteApi.get(
        `/${id}`
    );

};


export const getRetirosDePracticanteRequest = (
    practicanteId
) => {

    return retiroPracticanteApi.get(
        `/practicante/${practicanteId}`
    );

};