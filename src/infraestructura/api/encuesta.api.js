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
// - PeriodoPlantilla
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
// EDITAR PLANTILLA
// =============================
// Actualiza:
// - Titulo
// - Descripcion
// - Rol

export const editarEncuestaRequest = (id, data) => {

    return encuestaApi.put(
        `/${id}`,
        data
    );

};


// =============================
// EDITAR VERSION / PERIODO
// =============================
// Actualiza:
// - Version
// - Preguntas
// - Opciones

export const editarPeriodoPlantillaRequest = (
    id,
    data
) => {

    return encuestaApi.put(
        `/periodo/${id}`,
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