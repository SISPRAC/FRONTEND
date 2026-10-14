import { useState } from "react";
import { CalendarDays, Check, X, Users, MapPin, LoaderCircle} from "lucide-react";
import EstadoBadge from "../estadoBadge/EstadoBadge";

const MAX_VISIBLES = 3;

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

const SolicitudVisitaCard = ({
    solicitud,
    onAceptar,
    onRechazar,
    onVerVisita,
    visitaCargando = false,
    bloquearAcciones = false
}) => {
    const [verTodos, setVerTodos] = useState(false);

    const fechas = solicitud.fechasPropuestas || [];
    const practicantes = solicitud.practicantes || [];

    const visibles = verTodos
        ? practicantes
        : practicantes.slice(0, MAX_VISIBLES);

    const ocultos = practicantes.length - MAX_VISIBLES;

    const estado = solicitud.estado;

    const esPendiente = estado === "Pendiente";
    const esRechazada = estado === "Rechazada";
    const esAceptada = estado === "Aceptada";

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

                {/* Fechas */}
                <div className="flex items-start gap-2 mt-3">
                    <CalendarDays
                        size={15}
                        className="text-gray-400 mt-1 shrink-0"
                    />

                    {fechas.length === 0 ? (
                        <p className="text-xs text-gray-500">
                            No hay fechas propuestas.
                        </p>
                    ) : (
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
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <X size={15} />
                            Rechazar
                        </button>

                        <button
                            onClick={() => onAceptar(solicitud)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                        disabled={bloquearAcciones}
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
