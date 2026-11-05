import axios from "axios";


const tipoInformeApi = axios.create({

    baseURL: "http://localhost:3000/api/tipoInforme",

    withCredentials: true

});


// Agregar token automáticamente a cada petición
tipoInformeApi.interceptors.request.use(

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


// Obtener todos los tipos de informe
export const getTiposInformeRequest = async () => {

    return await tipoInformeApi.get("/all");

};


// Crear tipo de informe
export const createTipoInformeRequest = async (
    data
) => {

    return await tipoInformeApi.post(
        "/crear",
        data
    );

};


// Eliminar tipo de informe
export const deleteTipoInformeRequest = async (
    id
) => {

    return await tipoInformeApi.delete(
        `/${id}`
    );

};


// Obtener tipo de informe por ID
export const getTipoInformeByIdRequest = async (
    id
) => {

    return await tipoInformeApi.get(
        `/${id}`
    );

};


// Actualizar tipo de informe
export const updateTipoInformeRequest = async (
    id,
    data
) => {

    return await tipoInformeApi.put(
        `/${id}`,
        data
    );

};