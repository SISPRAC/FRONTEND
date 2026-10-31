// ---------------------------------------------------------------
// Construye la lista de eventos (historial) a partir de las
// entregas de un informe. Se comparte entre practicante,
// tutores y director.
// ---------------------------------------------------------------

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
                comentario: entrega.observacion_tutor_docente
                    ? `Tutor docente: ${entrega.observacion_tutor_docente}`
                    : "Revisión del tutor docente",
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
                comentario: entrega.observacion_tutor_empresarial
                    ? `Tutor empresarial: ${entrega.observacion_tutor_empresarial}`
                    : "Revisión del tutor empresarial",
            });
        }
    });

    return eventos;
}