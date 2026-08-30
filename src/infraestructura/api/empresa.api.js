import axios from "axios";

const empresaApi = axios.create({
    baseURL: "http://localhost:3000/api/empresa",
    withCredentials: true
});

// Agregar token automáticamente a cada petición
empresaApi.interceptors.request.use(

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


// Registrar empresa
export const registerEmpresaRequest = (data) => {

    return empresaApi.post(
        "/registrarEmpresa",
        data
    );
};


// Obtener empresa del usuario autenticado
export const getMiEmpresaRequest = () => {

    return empresaApi.get(
        "/mi-empresa"
    );
};


// Obtener grupos de la empresa autenticada
export const getMisGruposRequest = () => {

    return empresaApi.get(
        "/mis-grupos"
    );
};


// Obtener detalle de un grupo de la empresa autenticada
export const getDetalleGrupoEmpresaRequest = (practicaId) => {

    return empresaApi.get(
        `/mis-grupos/${practicaId}`
    );
};


// Actualizar empresa
export const actualizarEmpresaRequest = (
    id,
    data
) => {

    return empresaApi.put(
        `/${id}`,
        data
    );
};