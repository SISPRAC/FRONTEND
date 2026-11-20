const toDate = (d) => String(d ?? "").slice(0, 10);

export const getPracticaActual = (practicas = []) => {
    // fecha local de hoy en formato YYYY-MM-DD
    const hoy = new Date().toLocaleDateString("en-CA");

    const conFechas = practicas.filter(
        (p) => p.Periodo?.fecha_inicio && p.Periodo?.fecha_fin
    );

    // 1. la que está en curso hoy
    const enCurso = conFechas.find(
        (p) =>
            toDate(p.Periodo.fecha_inicio) <= hoy &&
            hoy <= toDate(p.Periodo.fecha_fin)
    );

    if (enCurso) return enCurso;

    // 2. si no hay ninguna en curso, la más reciente que ya empezó
    const yaIniciadas = conFechas
        .filter((p) => toDate(p.Periodo.fecha_inicio) <= hoy)
        .sort((a, b) =>
            toDate(b.Periodo.fecha_inicio).localeCompare(
                toDate(a.Periodo.fecha_inicio)
            )
        );

    return yaIniciadas[0] ?? null;
};