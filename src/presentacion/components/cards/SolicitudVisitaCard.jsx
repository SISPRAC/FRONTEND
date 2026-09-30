import { useState } from "react";
import { CalendarDays, Check, X, Users } from "lucide-react";
import EstadoBadge from "../estadoBadge/EstadoBadge";

const MAX_VISIBLES = 3;

const formatFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString("es-CO") : "Sin fecha";

const nombreCompleto = (p) =>
    [p.nombres, p.apellidos].filter(Boolean).join(" ") || "Practicante";

const SolicitudVisitaCard = ({ solicitud, onAceptar, onRechazar }) => {
    const [verTodos, setVerTodos] = useState(false);

    const fechas = solicitud.fechasPropuestas || [];
    const practicantes = solicitud.practicantes || [];

    const visibles = verTodos
        ? practicantes
        : practicantes.slice(0, MAX_VISIBLES);

    const ocultos = practicantes.length - MAX_VISIBLES;

    return (
        <div className="border rounded-xl p-4">

            {/* Encabezado */}
            <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-gray-800 text-sm">
                    Solicitud del {formatFecha(solicitud.fecha_creacion)}
                </h3>

                {solicitud.estado && (
                    <EstadoBadge estado={solicitud.estado} />
                )}
            </div>

            {/* Practicantes */}
            <div className="flex items-start gap-2 mt-3">
                <Users size={15} className="text-gray-400 mt-1 shrink-0" />

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
                            onClick={() => setVerTodos((v) => !v)}
                            className="px-2.5 py-1 text-xs text-red-600 hover:underline"
                        >
                            {verTodos ? "Ver menos" : `+${ocultos} más`}
                        </button>
                    )}
                </div>
            </div>

            {/* Fechas */}
            <div className="flex items-start gap-2 mt-3">
                <CalendarDays size={15} className="text-gray-400 mt-1 shrink-0" />

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
                                · {f.hora_inicio || "Sin hora"} -{" "}
                                {f.hora_fin || "Sin hora"}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
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
            </div>
        </div>
    );
};

export default SolicitudVisitaCard;