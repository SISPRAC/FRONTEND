import axios from "axios";

const encuestaApi = axios.create({
    baseURL: "http://localhost:3000/api/encuesta",
    withCredentials: true
});


// Agregar token automáticamente a cada petición
encuestaApi.interceptors.request.use(
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


// =============================
// OBTENER TODAS LAS ENCUESTAS
// =============================
export const getEncuestasRequest = () => {
    return encuestaApi.get("/all");
};


// =============================
// CREAR ENCUESTA COMPLETA
// Crea:
// - PlantillaEncuesta
// - Preguntas
// - Opciones
// =============================
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
export const editarEncuestaRequest = (id, data) => {
    return encuestaApi.put(
        `/${id}`,
        data
    );
};


// =============================
// ASIGNAR ENCUESTA A PRÁCTICA
// Crea:
// - PracticaEncuesta
// =============================
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


// =============================
// OBTENER ENCUESTAS DEL PRACTICANTE
// =============================
export const obtenerEncuestasPracticanteRequest = async () => {
    return await encuestaApi.get(
        "/practicante"
    );
};


// =============================
// OBTENER ENCUESTAS PARA EVALUAR
// =============================
export const obtenerEncuestasEvaluacionPracticanteRequest = async (
    practicante_id,
    rolEvaluador
) => {
    return await encuestaApi.get(
        `/evaluacion/${practicante_id}/${encodeURIComponent(rolEvaluador)}`
    );
};

// =============================
// RESPONDER ENCUESTA DE EVALUACIÓN
// =============================
export const responderEncuestaEvaluacionPracticanteRequest = async (
    data
) => {
    return await encuestaApi.post(
        "/responder-evaluacion",
        data
    );
};


// =============================
// RESPONDER ENCUESTA DEL PRACTICANTE
// =============================
export const responderEncuestaPracticanteRequest = async (
    data
) => {
    return await encuestaApi.post(
        "/responder-practicante",
        data
    );
};


// =============================
// OBTENER ENCUESTAS Y RESPUESTAS DEL PRACTICANTE
// Solo Director de Programa
// Incluye prácticas en curso y finalizadas
// =============================
export const obtenerRespuestasEncuestasPracticanteRequest = async (
    practicante_id
) => {
    return await encuestaApi.get(
        `/practicante/${practicante_id}/respuestas`
    );
};

