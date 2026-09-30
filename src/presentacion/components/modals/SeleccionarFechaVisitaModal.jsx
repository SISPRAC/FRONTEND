import { useEffect, useState } from "react";
import { CalendarDays, Clock, X } from "lucide-react";

const SeleccionarFechaVisitaModal = ({
    mostrar,
    solicitud,
    onCerrar,
    onConfirmar
}) => {

    const [rangoSeleccionado, setRangoSeleccionado] =
        useState(null);

    const [fecha, setFecha] =
        useState("");

    const [hora, setHora] =
        useState("");


    useEffect(() => {

        if (!mostrar) {
            setRangoSeleccionado(null);
            setFecha("");
            setHora("");
        }

    }, [mostrar]);


    if (!mostrar || !solicitud) {
        return null;
    }


    const fechas =
        solicitud.fechasPropuestas || [];


    const seleccionarRango = (rango) => {

        setRangoSeleccionado(rango);

        setFecha("");
        setHora("");

    };


    const obtenerFechaMinima = () => {

        if (!rangoSeleccionado?.fecha_inicio) {
            return "";
        }

        return rangoSeleccionado.fecha_inicio
            .split("T")[0];

    };


    const obtenerFechaMaxima = () => {

        if (!rangoSeleccionado?.fecha_fin) {
            return "";
        }

        return rangoSeleccionado.fecha_fin
            .split("T")[0];

    };


    const obtenerHoraMinima = () => {

        if (!rangoSeleccionado?.hora_inicio) {
            return "";
        }

        return rangoSeleccionado.hora_inicio;

    };


    const obtenerHoraMaxima = () => {

        if (!rangoSeleccionado?.hora_fin) {
            return "";
        }

        return rangoSeleccionado.hora_fin;

    };


    const confirmar = () => {

        if (!rangoSeleccionado) {
            return;
        }

        if (!fecha) {
            return;
        }

        if (!hora) {
            return;
        }


        onConfirmar({

            solicitudId: solicitud.id,

            rangoId: rangoSeleccionado.id,

            fecha,

            hora

        });

    };


    return (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">


                {/* HEADER */}

                <div className="flex items-center justify-between px-6 py-4 border-b">

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

                <div className="p-6 space-y-5">


                    {/* RANGOS */}

                    <div>

                        <div className="flex items-center gap-2 mb-3">

                            <CalendarDays
                                size={18}
                                className="text-gray-500"
                            />

                            <p className="text-sm font-medium text-gray-700">

                                Disponibilidades

                            </p>

                        </div>


                        {fechas.length === 0 ? (

                            <p className="text-sm text-gray-500">

                                No hay disponibilidades registradas.

                            </p>

                        ) : (

                            <div className="space-y-2">

                                {fechas.map((rango) => {

                                    const seleccionado =
                                        rangoSeleccionado?.id ===
                                        rango.id;


                                    return (

                                        <button
                                            key={rango.id}
                                            type="button"
                                            onClick={() =>
                                                seleccionarRango(
                                                    rango
                                                )
                                            }
                                            className={`w-full text-left border rounded-lg p-3 transition-colors ${
                                                seleccionado
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                                            }`}
                                        >

                                            <p className="text-sm font-medium text-gray-800">

                                                {rango.fecha_inicio
                                                    ? new Date(
                                                        rango.fecha_inicio
                                                    ).toLocaleDateString(
                                                        "es-CO"
                                                    )
                                                    : "Sin fecha"}

                                                {" - "}

                                                {rango.fecha_fin
                                                    ? new Date(
                                                        rango.fecha_fin
                                                    ).toLocaleDateString(
                                                        "es-CO"
                                                    )
                                                    : "Sin fecha"}

                                            </p>


                                            {(rango.hora_inicio ||
                                                rango.hora_fin) && (

                                                <p className="text-xs text-gray-500 mt-1">

                                                    {rango.hora_inicio ||
                                                        "Sin hora inicial"}

                                                    {" - "}

                                                    {rango.hora_fin ||
                                                        "Sin hora final"}

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
                                min={obtenerFechaMinima()}
                                max={obtenerFechaMaxima()}
                                onChange={(e) =>
                                    setFecha(e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                            />

                            <p className="text-xs text-gray-500 mt-1">

                                Selecciona una fecha dentro del rango disponible.

                            </p>

                        </div>

                    )}


                    {/* HORA */}

                    {rangoSeleccionado && (

                        <div>

                            <label className="block text-sm font-medium text-gray-700 mb-2">

                                Hora de la visita

                            </label>

                            <div className="relative">

                                <Clock
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                />

                                <input
                                    type="time"
                                    value={hora}
                                    min={obtenerHoraMinima()}
                                    max={obtenerHoraMaxima()}
                                    onChange={(e) =>
                                        setHora(e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                                />

                            </div>

                            <p className="text-xs text-gray-500 mt-1">

                                Horario disponible:{" "}

                                {rangoSeleccionado.hora_inicio ||
                                    "--:--"}

                                {" - "}

                                {rangoSeleccionado.hora_fin ||
                                    "--:--"}

                            </p>

                        </div>

                    )}

                </div>


                {/* FOOTER */}

                <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">

                    <button
                        onClick={onCerrar}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >

                        Cancelar

                    </button>


                    <button
                        onClick={confirmar}
                        disabled={
                            !rangoSeleccionado ||
                            !fecha ||
                            !hora
                        }
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