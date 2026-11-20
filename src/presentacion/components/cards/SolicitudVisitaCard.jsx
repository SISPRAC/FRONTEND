import { useState, useMemo } from "react";
import { CalendarDays, Check, X, Users, MapPin, LoaderCircle } from "lucide-react";
import EstadoBadge from "../estadoBadge/EstadoBadge";

const MAX_VISIBLES = 3;
const PASO_MIN = 60; // duración de cada franja horaria en minutos (30 para medias horas)

// Evita problemas de zona horaria con fechas YYYY-MM-DD
const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    const [year, month, day] = fecha.split("-");

    if (year && month && day) {
        return `${day}/${month}/${year}`;
    }

    return "Sin fecha";
};

// Convierte HH:mm:ss a formato de 12 horas AM/PM
const formatHora = (hora) => {
    if (!hora) return "Sin hora";

    const [horas, minutos] = hora.split(":");

    let hora12 = parseInt(horas, 10);

    if (isNaN(hora12)) return "Sin hora";

    const periodo = hora12 >= 12 ? "PM" : "AM";

    hora12 = hora12 % 12;

    if (hora12 === 0) {
        hora12 = 12;
    }

    return `${hora12}:${minutos} ${periodo}`;
};

const nombreCompleto = (p) =>
    [p.nombres, p.apellidos].filter(Boolean).join(" ") || "Practicante";

// Parsea YYYY-MM-DD como fecha local (sin problemas de zona horaria)
const parseFecha = (f) => {
    const [y, m, d] = f.split("-").map(Number);
    return new Date(y, m - 1, d);
};

const toISO = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;

// Todos los días entre inicio y fin (inclusive)
const diasEnRango = (inicio, fin) => {
    const dias = [];
    const cursor = parseFecha(inicio);
    const limite = parseFecha(fin || inicio);

    while (cursor <= limite) {
        dias.push(toISO(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return dias;
};

const aMinutos = (h) => {
    const [hh, mm] = h.split(":").map(Number);
    return hh * 60 + mm;
};

const deMinutos = (min) =>
    `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

// Franjas horarias disponibles dentro de un rango
const generarHoras = (inicio, fin) => {
    const horas = [];
    const ini = aMinutos(inicio);
    const f = aMinutos(fin);

    for (let m = ini; m + PASO_MIN <= f; m += PASO_MIN) {
        horas.push(deMinutos(m));
    }

    // Si el rango es más corto que una franja, ofrece al menos la hora de inicio
    if (horas.length === 0) horas.push(deMinutos(ini));

    return horas;
};

const SolicitudVisitaCard = ({
    solicitud,
    onAceptar,
    onRechazar,
    onVerVisita,
    visitaCargando = false,
    bloquearAcciones = false,
    estadosPracticantes = new Map()
}) => {
    const [verTodos, setVerTodos] = useState(false);
    const [fechaSel, setFechaSel] = useState("");
    const [horaSel, setHoraSel] = useState("");

    const fechas = solicitud.fechasPropuestas || [];
    const practicantes = solicitud.practicantes || [];

    const normalizarNombre = (nombre) =>
        nombre
            ?.trim()
            .toLowerCase()
            .replace(/\s+/g, " ");

    const practicantesNoDisponibles = practicantes.filter((p) => {
        const nombre = normalizarNombre(
            [p.nombres, p.apellidos].filter(Boolean).join(" ")
        );

        return estadosPracticantes.get(nombre)?.noDisponible;
    });

    const tienePracticantesNoDisponibles =
        practicantesNoDisponibles.length > 0;

    const motivoAccionesDeshabilitadas =
        "Esta solicitud incluye practicantes retirados, cancelados o con la práctica finalizada.";

    const visibles = verTodos
        ? practicantes
        : practicantes.slice(0, MAX_VISIBLES);

    const ocultos = practicantes.length - MAX_VISIBLES;

    const estado = solicitud.estado;

    const esPendiente = estado === "Pendiente";
    const esRechazada = estado === "Rechazada";
    const esAceptada = estado === "Aceptada";

    // ---------- Opciones de fecha ----------
    const opcionesFecha = useMemo(() => {
        const set = new Set();

        fechas.forEach((f) => {
            if (!f.fecha_inicio) return;
            diasEnRango(f.fecha_inicio, f.fecha_fin).forEach((d) => set.add(d));
        });

        return [...set].sort();
    }, [fechas]);

    // Si solo hay una fecha, queda seleccionada automáticamente
    const fechaEfectiva =
        fechaSel && opcionesFecha.includes(fechaSel)
            ? fechaSel
            : opcionesFecha.length === 1
            ? opcionesFecha[0]
            : "";

    // ---------- Opciones de hora (dependen de la fecha elegida) ----------
    const opcionesHora = useMemo(() => {
        if (!fechaEfectiva) return [];

        const set = new Set();

        fechas.forEach((f) => {
            if (!f.fecha_inicio || !f.hora_inicio || !f.hora_fin) return;

            const dias = diasEnRango(f.fecha_inicio, f.fecha_fin);

            if (dias.includes(fechaEfectiva)) {
                generarHoras(f.hora_inicio, f.hora_fin).forEach((h) =>
                    set.add(h)
                );
            }
        });

        return [...set].sort();
    }, [fechas, fechaEfectiva]);

    // Si solo hay una hora, queda seleccionada automáticamente
    const horaEfectiva =
        horaSel && opcionesHora.includes(horaSel)
            ? horaSel
            : opcionesHora.length === 1
            ? opcionesHora[0]
            : "";

    const seleccionCompleta = Boolean(fechaEfectiva && horaEfectiva);

    return (
        <div className="border rounded-xl p-4 flex flex-col h-full">

            {/* Contenido de la card */}
            <div className="flex-1">

                {/* Encabezado */}
                <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-gray-800 text-sm">
                        Solicitud del{" "}
                        {formatFecha(
                            solicitud.fecha_creacion?.split("T")[0]
                        )}
                    </h3>

                    {solicitud.estado && (
                        <EstadoBadge estado={solicitud.estado} />
                    )}
                </div>

                {/* Practicantes */}
                <div className="flex items-start gap-2 mt-3">
                    <Users
                        size={15}
                        className="text-gray-400 mt-1 shrink-0"
                    />

                    <div className="flex flex-wrap gap-1.5">
                        {visibles.map((p) => (
                            <span
                                key={p.id}
                                className="px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-700"
                            >
                                {nombreCompleto(p)}
                            </span>
                        ))}

                        {practicantes.length > MAX_VISIBLES && (
                            <button
                                onClick={() =>
                                    setVerTodos((v) => !v)
                                }
                                className="px-2.5 py-1 text-xs text-red-600 hover:underline"
                            >
                                {verTodos
                                    ? "Ver menos"
                                    : `+${ocultos} más`}
                            </button>
                        )}
                    </div>
                </div>

                {/* Fecha y hora */}
                <div className="flex items-start gap-2 mt-3">
                    <CalendarDays
                        size={15}
                        className="text-gray-400 mt-1 shrink-0"
                    />

                    {fechas.length === 0 ? (
                        <p className="text-xs text-gray-500">
                            No hay fechas propuestas.
                        </p>
                    ) : esPendiente ? (
                        <div className="flex flex-col sm:flex-row gap-2 w-full">

                            {/* Select de fecha */}
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Fecha
                                </label>

                                <select
                                    value={fechaEfectiva}
                                    onChange={(e) => {
                                        setFechaSel(e.target.value);
                                        setHoraSel("");
                                    }}
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                    {opcionesFecha.length !== 1 && (
                                        <option value="">
                                            Selecciona una fecha
                                        </option>
                                    )}

                                    {opcionesFecha.map((d) => (
                                        <option key={d} value={d}>
                                            {formatFecha(d)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Select de hora */}
                            <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">
                                    Hora
                                </label>

                                <select
                                    value={horaEfectiva}
                                    onChange={(e) => setHoraSel(e.target.value)}
                                    disabled={!fechaEfectiva}
                                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    {opcionesHora.length !== 1 && (
                                        <option value="">
                                            Selecciona una hora
                                        </option>
                                    )}

                                    {opcionesHora.map((h) => (
                                        <option key={h} value={h}>
                                            {formatHora(h)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                        </div>
                    ) : (
                        // Aceptada / rechazada: solo lectura
                        <ul className="text-xs text-gray-600 space-y-1">
                            {fechas.map((f) => (
                                <li key={f.id}>
                                    <span className="font-medium text-gray-800">
                                        {formatFecha(f.fecha_inicio)} -{" "}
                                        {formatFecha(f.fecha_fin)}
                                    </span>{" "}
                                    · {formatHora(f.hora_inicio)} -{" "}
                                    {formatHora(f.hora_fin)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">

                {/* Sin fechas propuestas */}
                {fechas.length === 0 && (
                    <p className="w-full text-center text-xs text-gray-500 py-1">
                        No se han solicitado fechas para esta visita.
                    </p>
                )}

                {/* Solicitud pendiente con fechas */}
                {fechas.length > 0 && esPendiente && (
                    <>
                        <button
                            onClick={() => onRechazar(solicitud)}
                            disabled={
                                bloquearAcciones || tienePracticantesNoDisponibles
                            }
                            title={
                                tienePracticantesNoDisponibles
                                    ? motivoAccionesDeshabilitadas
                                    : undefined
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={15} />
                            Rechazar
                        </button>

                        <button
                            onClick={() =>
                                onAceptar(solicitud, {
                                    fecha: fechaEfectiva,
                                    hora: horaEfectiva
                                })
                            }
                            disabled={
                                bloquearAcciones ||
                                tienePracticantesNoDisponibles ||
                                !seleccionCompleta
                            }
                            title={
                                tienePracticantesNoDisponibles
                                    ? motivoAccionesDeshabilitadas
                                    : !seleccionCompleta
                                    ? "Selecciona una fecha y una hora"
                                    : undefined
                            }
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Check size={15} />
                            Aceptar
                        </button>
                    </>
                )}

                {/* Solicitud rechazada */}
                {fechas.length > 0 && esRechazada && (
                    <>
                        <button
                            disabled
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                        >
                            <X size={15} />
                            Rechazada
                        </button>

                        <button
                            disabled
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-200 text-gray-400 rounded-lg cursor-not-allowed"
                        >
                            <Check size={15} />
                            Aceptar
                        </button>
                    </>
                )}

                {/* Solicitud aceptada */}
                {fechas.length > 0 && esAceptada && (
                    <button
                        type="button"
                        onClick={onVerVisita}
                        disabled={
                            bloquearAcciones || tienePracticantesNoDisponibles
                        }
                        title={
                            tienePracticantesNoDisponibles
                                ? motivoAccionesDeshabilitadas
                                : undefined
                        }
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#e8192c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {visitaCargando ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                Cargando visita...
                            </>
                        ) : (
                            <>
                                <MapPin size={16} />
                                Ver visita
                            </>
                        )}
                    </button>
                )}

            </div>

        </div>
    );
};

export default SolicitudVisitaCard;