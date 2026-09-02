import GestionTutores from "../../components/GestionTutores";

import { tutorEmpresarialRepository } from "../../../infraestructura/repository/tutorEmpresarialRepository";
import { getTutorEmpresariales } from "../../../aplicacion/tutorEmpresarial/getTutorEmpresarial";

import { userRepository } from "../../../infraestructura/repository/userRepository";
import { cambiarEstadoUsuario } from "../../../aplicacion/usuario/cambiarEstado";
import { invitarTutorEmpresarial }
    from "../../../aplicacion/tutorEmpresarial/invitarTutorEmpresarial";

export default function TutoresEmpresariales() {

    const casosDeUso = {

        getTutores: () =>
            getTutorEmpresariales({
                tutorEmpresarialRepository
            }),

        inviteTutor: (correo) =>
            invitarTutorEmpresarial(
                { tutorEmpresarialRepository },
                correo
            ),

         toggleEstadoTutor: (id_usuario, nuevoEstado) =>
            cambiarEstadoUsuario(
                { userRepository },
                id_usuario,
                nuevoEstado
            )

    };

    return (
        <GestionTutores
            titulo="Tutores Empresariales"
            footerLabel="Empresa"
            casosDeUso={casosDeUso}
        />
    );
}