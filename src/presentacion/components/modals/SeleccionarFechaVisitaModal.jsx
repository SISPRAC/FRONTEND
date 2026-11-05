import { useEffect, useState } from "react";
import { CalendarDays, Clock, X } from "lucide-react";

const HORAS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTOS = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
);

// Clases estáticas (Tailwind no detecta clases armadas dinámicamente)
const columnasPorCantidad = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3"
};

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
    const [y, m, d] = valor.split("T")[0].split("-");
    return `${parseInt(d, 10)}/${parseInt(m, 10)}/${y}`;
};

const SeleccionarFechaVisitaModal = ({
    mostrar,
    solicitud,
    onCerrar,
    onConfirmar
}) => {

    const [rangoSeleccionado, setRangoSeleccionado] = useState(null);
    const [fecha, setFecha] = useState("");
    const [horaSel, setHoraSel] = useState("");
    const [minutoSel, setMinutoSel] = useState("");
    const [periodo, setPeriodo] = useState("AM");


    useEffect(() => {

        if (!mostrar) {
            setRangoSeleccionado(null);
            setFecha("");
            setHoraSel("");
            setMinutoSel("");
            setPeriodo("AM");
        }

    }, [mostrar]);


    if (!mostrar || !solicitud) {
        return null;
    }


    const fechas = solicitud.fechasPropuestas || [];

    // 1-3 fechas: una sola fila. 4 o más: 2 columnas.
    const columnas =
        columnasPorCantidad[fechas.length] || "grid-cols-2";


    const seleccionarRango = (rango) => {
        setRangoSeleccionado(rango);
        setFecha("");
        setHoraSel("");
        setMinutoSel("");
        setPeriodo("AM");
    };


    const fechaMin = rangoSeleccionado?.fecha_inicio
        ? rangoSeleccionado.fecha_inicio.split("T")[0]
        : "";

    const fechaMax = rangoSeleccionado?.fecha_fin
        ? rangoSeleccionado.fecha_fin.split("T")[0]
        : "";


    // Valida que la fecha no salga del rango (aunque la escriban a mano)
    const fechaValida =
        !fecha ||
        ((!fechaMin || fecha >= fechaMin) &&
            (!fechaMax || fecha <= fechaMax));


    // Hora en formato 24h "HH:mm" a partir de los selects
    const construirHora24 = () => {

        if (!horaSel || !minutoSel) {
            return "";
        }

        let h = parseInt(horaSel, 10);

        if (periodo === "AM" && h === 12) h = 0;
        if (periodo === "PM" && h !== 12) h += 12;

        return `${String(h).padStart(2, "0")}:${minutoSel}`;

    };

    const hora = construirHora24();


    const horaDentroDelRango = () => {

        if (!hora) return true;

        const min = rangoSeleccionado?.hora_inicio?.slice(0, 5);
        const max = rangoSeleccionado?.hora_fin?.slice(0, 5);

        if (min && hora < min) return false;
        if (max && hora > max) return false;

        return true;

    };

    const horaValida = horaDentroDelRango();

    const puedeConfirmar =
        rangoSeleccionado && fecha && hora && fechaValida && horaValida;


    const confirmar = () => {

        if (!puedeConfirmar) {
            return;
        }

        onConfirmar({
            solicitudId: solicitud.id,
            rangoId: rangoSeleccionado.id,
            fecha,
            hora // formato 24h, ej: "14:30"
        });

    };


    const selectClass =
        "w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-red-500";


    return (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

            {/* Sin alto fijo: se ajusta al contenido hasta 90vh */}
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


                {/* CONTENIDO (scroll interno si no cabe) */}

                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">


                    {/* RANGOS */}

                    <div>

                        <div className="flex items-center gap-2 mb-3">

                            <CalendarDays size={18} className="text-gray-500" />

                            <p className="text-sm font-medium text-gray-700">
                                Disponibilidades
                            </p>

                        </div>


                        {fechas.length === 0 ? (

                            <p className="text-sm text-gray-500">
                                No hay disponibilidades registradas.
                            </p>

                        ) : (

                            // Sin selección: hasta ~12 cards visibles, luego scroll.
                            // Con selección: se encoge para dar espacio a fecha y hora.
                            <div
                                className={`grid ${columnas} gap-2 overflow-y-auto pr-1 ${
                                    rangoSeleccionado
                                        ? "max-h-36"
                                        : "max-h-[27rem]"
                                }`}
                            >

                                {fechas.map((rango) => {

                                    const seleccionado =
                                        rangoSeleccionado?.id === rango.id;

                                    return (

                                        <button
                                            key={rango.id}
                                            type="button"
                                            onClick={() => seleccionarRango(rango)}
                                            className={`text-left border rounded-lg p-3 transition-colors ${
                                                seleccionado
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                                            }`}
                                        >

                                            <p className="text-sm font-medium text-gray-800">
                                                {formatearFecha(rango.fecha_inicio)}
                                                {" - "}
                                                {formatearFecha(rango.fecha_fin)}
                                            </p>

                                            {(rango.hora_inicio || rango.hora_fin) && (

                                                <p className="text-xs text-gray-500 mt-1">
                                                    {rango.hora_inicio
                                                        ? formatear12h(rango.hora_inicio)
                                                        : "Sin hora inicial"}
                                                    {" - "}
                                                    {rango.hora_fin
                                                        ? formatear12h(rango.hora_fin)
                                                        : "Sin hora final"}
                                                </p>

                                            )}

                                        </button>

                                    );

                                })}

                            </div>

                        )}

                    </div>


                    {/* FECHA */}

                    {rangoSeleccionado && (

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de la visita
                            </label>

                            <input
                                type="date"
                                value={fecha}
                                min={fechaMin}
                                max={fechaMax}
                                onChange={(e) => setFecha(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />

                            <p className="text-xs text-gray-500 mt-1">
                                Disponible del {formatearFecha(rangoSeleccionado.fecha_inicio)}
                                {" al "}
                                {formatearFecha(rangoSeleccionado.fecha_fin)}
                            </p>

                            {!fechaValida && (
                                <p className="text-xs text-red-600 mt-1">
                                    La fecha está fuera del rango seleccionado.
                                </p>
                            )}

                        </div>

                    )}


                    {/* HORA (AM / PM) */}

                    {rangoSeleccionado && (

                        <div>

                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <Clock size={16} className="text-gray-400" />
                                Hora de la visita
                            </label>

                            <div className="grid grid-cols-3 gap-2">

                                <select
                                    value={horaSel}
                                    onChange={(e) => setHoraSel(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="" disabled>
                                        Hora
                                    </option>
                                    {HORAS.map((h) => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>

                                <select
                                    value={minutoSel}
                                    onChange={(e) => setMinutoSel(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="" disabled>
                                        Min
                                    </option>
                                    {MINUTOS.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>

                                <select
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>

                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                                Horario disponible:{" "}
                                {rangoSeleccionado.hora_inicio
                                    ? formatear12h(rangoSeleccionado.hora_inicio)
                                    : "--:--"}
                                {" - "}
                                {rangoSeleccionado.hora_fin
                                    ? formatear12h(rangoSeleccionado.hora_fin)
                                    : "--:--"}
                            </p>

                            {!horaValida && (
                                <p className="text-xs text-red-600 mt-1">
                                    La hora está fuera del horario disponible.
                                </p>
                            )}

                        </div>

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