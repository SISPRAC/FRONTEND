import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock, X } from "lucide-react";

const PASO_MIN = 60; // duración de cada franja en minutos

// "14:30" o "14:30:00" -> "2:30 PM"
const formatear12h = (hora24) => {
    if (!hora24) return "";
    const [h, m] = hora24.split(":");
    const hNum = parseInt(h, 10);
    const periodo = hNum >= 12 ? "PM" : "AM";
    const h12 = hNum % 12 === 0 ? 12 : hNum % 12;
    return `${h12}:${m} ${periodo}`;
};

// "2025-03-10T00:00:00Z" -> "10/3/2025" (sin desfase por zona horaria)
const formatearFecha = (valor) => {
    if (!valor) return "Sin fecha";
    const [y, m, d] = String(valor).slice(0, 10).split("-");
    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
};

const parseFecha = (f) => {
    const [y, m, d] = String(f).slice(0, 10).split("-").map(Number);
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
    const [hh, mm] = String(h).slice(0, 5).split(":").map(Number);
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

    // Si el rango es más corto que una franja, ofrece al menos la hora inicial
    if (horas.length === 0) horas.push(deMinutos(ini));

    return horas;
};

const selectClass =
    "w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:text-gray-400";

const SeleccionarFechaVisitaModal = ({
    mostrar,
    solicitud,
    onCerrar,
    onConfirmar
}) => {
    const [fechaSel, setFechaSel] = useState("");
    const [horaSel, setHoraSel] = useState("");

    useEffect(() => {
        if (!mostrar) {
            setFechaSel("");
            setHoraSel("");
        }
    }, [mostrar]);

    const fechas = solicitud?.fechasPropuestas || [];

    // ---------- Opciones de fecha (días de todos los rangos, sin pasadas) ----------
    const opcionesFecha = useMemo(() => {
        const hoy = toISO(new Date());
        const set = new Set();

        fechas.forEach((r) => {
            if (!r.fecha_inicio) return;
            diasEnRango(r.fecha_inicio, r.fecha_fin).forEach((d) => {
                if (d >= hoy) set.add(d);
            });
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
    // Cada opción guarda también el rango del que viene
    const opcionesHora = useMemo(() => {
        if (!fechaEfectiva) return [];

        const ahora = new Date();
        const esHoy = fechaEfectiva === toISO(ahora);
        const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

        const mapa = new Map(); // hora -> rango

        fechas.forEach((r) => {
            if (!r.fecha_inicio || !r.hora_inicio || !r.hora_fin) return;

            const dias = diasEnRango(r.fecha_inicio, r.fecha_fin);
            if (!dias.includes(fechaEfectiva)) return;

            generarHoras(r.hora_inicio, r.hora_fin).forEach((h) => {
                if (esHoy && aMinutos(h) <= minutosAhora) return;
                if (!mapa.has(h)) mapa.set(h, r);
            });
        });

        return [...mapa.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([valor, rango]) => ({ valor, rango }));
    }, [fechas, fechaEfectiva]);

    // Si solo hay una hora, queda seleccionada automáticamente
    const horaEfectiva =
        horaSel && opcionesHora.some((o) => o.valor === horaSel)
            ? horaSel
            : opcionesHora.length === 1
            ? opcionesHora[0].valor
            : "";

    const opcionElegida = opcionesHora.find((o) => o.valor === horaEfectiva);

    const puedeConfirmar = Boolean(fechaEfectiva && horaEfectiva && opcionElegida);

    if (!mostrar || !solicitud) {
        return null;
    }

    const confirmar = () => {
        if (!puedeConfirmar) return;

        onConfirmar({
            solicitudId: solicitud.id,
            rangoId: opcionElegida.rango.id,
            fecha: fechaEfectiva,
            hora: horaEfectiva // formato 24h, ej: "14:00"
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Seleccionar fecha de visita
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Selecciona una fecha y hora dentro de la disponibilidad.
                        </p>
                    </div>

                    <button
                        onClick={onCerrar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* CONTENIDO */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">

                    {opcionesFecha.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay fechas disponibles para esta solicitud.
                        </p>
                    ) : (
                        <>
                            {/* FECHA */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <CalendarDays size={16} className="text-gray-400" />
                                    Fecha de la visita
                                </label>

                                <select
                                    value={fechaEfectiva}
                                    onChange={(e) => {
                                        setFechaSel(e.target.value);
                                        setHoraSel("");
                                    }}
                                    className={selectClass}
                                >
                                    {opcionesFecha.length !== 1 && (
                                        <option value="" disabled>
                                            Selecciona una fecha
                                        </option>
                                    )}

                                    {opcionesFecha.map((d) => (
                                        <option key={d} value={d}>
                                            {formatearFecha(d)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* HORA */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Clock size={16} className="text-gray-400" />
                                    Hora de la visita
                                </label>

                                <select
                                    value={horaEfectiva}
                                    onChange={(e) => setHoraSel(e.target.value)}
                                    disabled={!fechaEfectiva}
                                    className={selectClass}
                                >
                                    {opcionesHora.length !== 1 && (
                                        <option value="" disabled>
                                            {fechaEfectiva
                                                ? "Selecciona una hora"
                                                : "Elige primero la fecha"}
                                        </option>
                                    )}

                                    {opcionesHora.map((o) => (
                                        <option key={o.valor} value={o.valor}>
                                            {formatear12h(o.valor)}
                                        </option>
                                    ))}
                                </select>

                                {fechaEfectiva && opcionesHora.length === 0 && (
                                    <p className="text-xs text-red-600 mt-1">
                                        No hay horas disponibles para esta fecha.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50 shrink-0">
                    <button
                        onClick={onCerrar}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={confirmar}
                        disabled={!puedeConfirmar}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        Confirmar visita
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SeleccionarFechaVisitaModal;