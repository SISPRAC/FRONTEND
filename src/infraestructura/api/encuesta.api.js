import axios from "axios";

const encuestaApi = axios.create({
    baseURL: "http://localhost:3000/api/encuesta",
    withCredentials: true
});

// =============================
// OBTENER TODAS LAS ENCUESTAS
// =============================
export const getEncuestasRequest = () => {
    return encuestaApi.get("/all");
};

// =============================
// CREAR ENCUESTA COMPLETA
// =============================
// Crea:
// - PlantillaEncuesta
// - Preguntas
// - Opciones
export const createEncuestaRequest = async (data) => {
    return await encuestaApi.post(
        "/crear",
        data
    );
};

// =============================
// OBTENER UNA ENCUESTA
// =============================
export const getEncuestaRequest = (id) => {
    return encuestaApi.get(
        `/${id}`
    );
};

// =============================
// ACTUALIZAR ENCUESTA
// =============================
// Actualiza la plantilla y sus preguntas/opciones
// según las reglas del backend.
export const editarEncuestaRequest = (id, data) => {
    return encuestaApi.put(
        `/${id}`,
        data
    );
};

// =============================
// ASIGNAR ENCUESTA A PRÁCTICA
// =============================
// Crea:
// - PracticaEncuesta
export const asignarEncuestaPracticaRequest = (data) => {
    return encuestaApi.post(
        "/asignar-practica",
        data
    );
};

// =============================
// ELIMINAR ENCUESTA
// =============================
export const deleteEncuestaRequest = (id) => {
    return encuestaApi.delete(
        `/${id}`
    );
};