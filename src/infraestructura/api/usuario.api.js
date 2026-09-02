import axios from "axios";

const userApi = axios.create({

    baseURL: "http://localhost:3000/api/users",

    withCredentials: true

});

userApi.interceptors.request.use(

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

export const getUsersRequest = async () => {
    return await userApi.get("/all");
};

export const getUserRequest = async () => {
    return await userApi.get("/me");
};

export const updateUserRolesRequest = async (id, roles) => {
    return await userApi.put(`/${id}/roles`, {
        roles
    });
};

export const deleteUserRequest = async (id) => {
    return await userApi.delete(`/${id}`);
};

export const cambiarEstadoUsuarioRequest = async (id, estado) => {
    return await userApi.patch(`/${id}/estado`, {
        estado
    });
};