import GestionTutores from "../../components/GestionTutores";

import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository";
import { getTutorDocentes } from "../../../aplicacion/tutorDocente/getTutorDocente";
import { invitarTutorDocente } from "../../../aplicacion/tutorDocente/invitarTutorDocente";

import { userRepository } from "../../../infraestructura/repository/userRepository";
import { cambiarEstadoUsuario } from "../../../aplicacion/usuario/cambiarEstado";

export default function TutoresDocentes() {

    const casosDeUso = {

        getTutores: () =>
            getTutorDocentes({
                tutorDocenteRepository
            }),

        inviteTutor: async (correo) => {
            return await invitarTutorDocente(
                tutorDocenteRepository,
                correo
            );
        },

        toggleEstadoTutor: (id_usuario, nuevoEstado) =>
            cambiarEstadoUsuario(
                { userRepository },
                id_usuario,
                nuevoEstado
            )
    };

    return (
        <GestionTutores
            titulo="Tutores Docentes"
            footerLabel="Director"
            casosDeUso={casosDeUso}
        />
    );
}

