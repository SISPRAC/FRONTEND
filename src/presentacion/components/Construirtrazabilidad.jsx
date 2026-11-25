// ---------------------------------------------------------------
// Construye la lista de eventos (historial) a partir de las
// entregas de un informe. Se comparte entre practicante,
// tutores y director.
// ---------------------------------------------------------------

// Nombre completo del tutor de una entrega. Sirve para las dos formas en que
// llegan los datos: con `tutor_docente_nombre` / `tutor_empresarial_nombre`
// (endpoint de trazabilidad) o anidado en `tutorDocente.Usuario` /
// `tutorEmpresarial.Usuario` (listado de requisitos).
function nombreTutor(entrega, tipo) {

    const plano =
        tipo === "docente"
            ? entrega.tutor_docente_nombre
            : entrega.tutor_empresarial_nombre;

    if (plano) return plano;

    const tutor =
        tipo === "docente"
            ? entrega.tutorDocente
            : entrega.tutorEmpresarial;

    const usuario = tutor?.Usuario ?? tutor?.User;

    return (
        `${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`.trim() ||
        null
    );
}

export function construirTrazabilidad(entregas = []) {

    const ordenadas = [...entregas].sort(
        (a, b) => Number(a.version || 0) - Number(b.version || 0)
    );

    const eventos = [];

    ordenadas.forEach((entrega) => {

        const version = entrega.version || 1;

        // Entrega del practicante
        eventos.push({
            id: `entrega-${entrega.id}`,
            accion:
                version > 1
                    ? `ACTUALIZADO — Versión ${version}`
                    : `CARGADO — Versión ${version}`,
            fecha: entrega.fecha_entrega,
            comentario: "Documento enviado por el practicante",
        });

        // Tutor docente
        if (
            entrega.estado_tutor_docente &&
            entrega.estado_tutor_docente !== "PENDIENTE"
        ) {
            eventos.push({
                id: `docente-${entrega.id}`,
                accion: entrega.estado_tutor_docente,
                fecha:
                    entrega.fecha_revision_tutor_docente ||
                    entrega.fecha_entrega,
                responsable: nombreTutor(entrega, "docente")
                    ? `Tutor docente: ${nombreTutor(entrega, "docente")}`
                    : "Tutor docente",
                comentario: entrega.observacion_tutor_docente || "",
            });
        }

        // Tutor empresarial
        if (
            entrega.estado_tutor_empresarial &&
            entrega.estado_tutor_empresarial !== "PENDIENTE"
        ) {
            eventos.push({
                id: `empresarial-${entrega.id}`,
                accion: entrega.estado_tutor_empresarial,
                fecha:
                    entrega.fecha_revision_tutor_empresarial ||
                    entrega.fecha_entrega,
                responsable: nombreTutor(entrega, "empresarial")
                    ? `Tutor empresarial: ${nombreTutor(entrega, "empresarial")}`
                    : "Tutor empresarial",
                comentario: entrega.observacion_tutor_empresarial || "",
            });
        }
    });

    return eventos;
}