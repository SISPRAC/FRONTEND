import {
    getEntregaInformeByIdRequest,
    getEntregasInformeByPracticaInformeRequest,
    getEntregasInformeByPracticaPracticanteRequest,
    getEntregasInformeByPracticaPracticanteAndInformeRequest,
    createEntregaInformeRequest,
    reviewEntregaInformeTutorDocenteRequest,
    reviewEntregaInformeTutorEmpresarialRequest
} from "../api/entregaInforme.api.js";


export const entregaInformeRepository = {

    async findById(id) {

        const response =
            await getEntregaInformeByIdRequest(
                id
            );

        return response.data;

    },


    async findByPracticaInformeId(
        practica_informe_id
    ) {

        const response =
            await getEntregasInformeByPracticaInformeRequest(
                practica_informe_id
            );

        return response.data;

    },


    async findByPracticaPracticanteId(
        practica_practicante_id
    ) {

        const response =
            await getEntregasInformeByPracticaPracticanteRequest(
                practica_practicante_id
            );

        return response.data;

    },


    async findByPracticaPracticanteAndInforme(
        practica_practicante_id,
        practica_informe_id
    ) {

        const response =
            await getEntregasInformeByPracticaPracticanteAndInformeRequest(
                practica_practicante_id,
                practica_informe_id
            );

        return response.data;

    },


    async create(data) {

        const response =
            await createEntregaInformeRequest(
                data
            );

        return response.data;

    },


    async reviewTutorDocente(
        id,
        data
    ) {

        const response =
            await reviewEntregaInformeTutorDocenteRequest(
                id,
                data
            );

        return response.data;

    },


    async reviewTutorEmpresarial(
        id,
        data
    ) {

        const response =
            await reviewEntregaInformeTutorEmpresarialRequest(
                id,
                data
            );

        return response.data;

    }

};