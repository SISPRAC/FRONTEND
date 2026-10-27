import { useEffect, useState } from "react";
import {
    X,
    ClipboardCheck,
    CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

import { obtenerEncuestasEvaluacionPracticante } from "../../../aplicacion/encuesta/obtenerEncuestasEvaluacionPracticante.js";
import { responderEncuestaEvaluacionPracticante } from "../../../aplicacion/encuesta/responderEncuestaEvaluacionPracticante.js";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository.js";

const getPreguntas = (encuesta) =>
    [...(encuesta?.plantilla?.preguntas || [])].sort(
        (a, b) => a.orden - b.orden
    );

export default function EncuestaTutorEmpresarialModal({
    mostrar,
    practicante,
    rolEncuesta,
    onCerrar,
    modoConsulta = false,
    encuestaSeleccionada = null,
}) {
    const [encuestaActiva, setEncuestaActiva] = useState(null);
    const [respuestas, setRespuestas] = useState({});
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);

    // Solo lectura: modo consulta, o encuesta que ya fue realizada.
    const yaRespondida = Boolean(encuestaActiva?.respondida);
    const soloLectura = modoConsulta || yaRespondida;

    useEffect(() => {
        if (!mostrar) return;

        // Modo de consulta: utilizar la encuesta seleccionada.
        // No realizar peticiones ni permitir modificar respuestas.
        if (modoConsulta) {
            setCargando(false);
            setEnviando(false);
            setRespuestas({});
            setEncuestaActiva(encuestaSeleccionada);
            return;
        }

        if (!practicante?.id_practicante) return;

        let cancelado = false;

        const cargarEncuesta = async () => {
            setCargando(true);
            setEncuestaActiva(null);
            setRespuestas({});

            try {
                const data =
                    await obtenerEncuestasEvaluacionPracticante(
                        { encuestaRepository },
                        practicante.id_practicante,
                        rolEncuesta
                    );

                if (cancelado) return;

                const encuestas = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.data)
                        ? data.data
                        : [];

                // Solo se permite abrir una encuesta.
                const encuesta = encuestas[0] || null;

                if (!encuesta) {
                    toast.error(
                        "No se ha asignado una encuesta para este practicante."
                    );

                    onCerrar();
                    return;
                }

                // Si ya fue realizada, se muestra en solo lectura
                // (el banner del modal avisa que ya está realizada).
                setEncuestaActiva(encuesta);
            } catch (error) {
                if (cancelado) return;

                console.error(
                    "Error al cargar la encuesta:",
                    error
                );

                if (error.response?.status === 404) {
                    toast.error(
                        "No se ha asignado una encuesta para este practicante."
                    );
                } else {
                    toast.error(
                        error.response?.data?.message ||
                        "No se pudo cargar la encuesta."
                    );
                }

                onCerrar();
            } finally {
                if (!cancelado) {
                    setCargando(false);
                }
            }
        };

        cargarEncuesta();

        return () => {
            cancelado = true;
        };
    }, [
        mostrar,
        practicante?.id_practicante,
        rolEncuesta,
        modoConsulta,
        encuestaSeleccionada,
    ]);

    const cerrarModal = () => {
        if (enviando) return;

        setEncuestaActiva(null);
        setRespuestas({});
        onCerrar();
    };

    const seleccionarOpcion = (preguntaId, opcionId) => {
        if (soloLectura) return;

        setRespuestas((prev) => ({
            ...prev,
            [preguntaId]: opcionId,
        }));
    };

    const handleEnviar = async () => {
        if (!encuestaActiva || enviando || soloLectura) return;

        const preguntas = getPreguntas(encuestaActiva);

        if (preguntas.length === 0) {
            toast.error("La encuesta no tiene preguntas.");
            return;
        }

        const faltanRespuestas = preguntas.some(
            (pregunta) =>
                respuestas[pregunta.id] === undefined ||
                respuestas[pregunta.id] === null
        );

        if (faltanRespuestas) {
            toast.error("Debe responder todas las preguntas.");
            return;
        }

        // Convertir las opciones seleccionadas al texto de cada opción.
        const respuestasEncuesta = preguntas.map((pregunta) => {
            const opcionSeleccionada = (
                pregunta.OpcionesPregunta || []
            ).find(
                (opcion) =>
                    Number(opcion.id) ===
                    Number(respuestas[pregunta.id])
            );

            return {
                pregunta_id: pregunta.id,
                respuesta: opcionSeleccionada?.texto,
            };
        });

        // Validar que todas las opciones seleccionadas existan.
        if (
            respuestasEncuesta.some(
                (respuesta) =>
                    respuesta.respuesta === undefined ||
                    respuesta.respuesta === null
            )
        ) {
            toast.error(
                "No se encontraron algunas de las opciones seleccionadas."
            );
            return;
        }

        const payload = {
            practicante_id: practicante.id_practicante,
            practica_encuesta_id: encuestaActiva.id,
            respuestas: respuestasEncuesta,
        };

        try {
            setEnviando(true);

            await responderEncuestaEvaluacionPracticante(
                { encuestaRepository },
                payload
            );

            toast.success("Encuesta enviada correctamente");

            setEncuestaActiva(null);
            setRespuestas({});
            onCerrar();
        } catch (error) {
            console.error(
                "Error al enviar la encuesta:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "No se pudo enviar la encuesta."
            );
        } finally {
            setEnviando(false);
        }
    };

    if (!mostrar) return null;

    const preguntas = getPreguntas(encuestaActiva);

    const respondidas = soloLectura
        ? preguntas.filter((pregunta) =>
            (encuestaActiva?.respuestas || []).some(
                (respuesta) =>
                    Number(respuesta.pregunta_id) ===
                        Number(pregunta.id) &&
                    respuesta.respuesta !== null &&
                    respuesta.respuesta !== undefined &&
                    respuesta.respuesta !== ""
            )
        ).length
        : preguntas.filter(
            (pregunta) =>
                respuestas[pregunta.id] !== undefined &&
                respuestas[pregunta.id] !== null
        ).length;

    const progreso = preguntas.length
        ? (respondidas / preguntas.length) * 100
        : 0;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-3 sm:p-5">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* Encabezado */}
                <div className="flex items-start justify-between gap-4 border-b p-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                            <ClipboardCheck size={22} />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-800">
                                {soloLectura
                                    ? "Detalle de respuestas"
                                    : "Encuesta al practicante"}
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                {practicante?.nombre || "Practicante"}
                            </p>

                            {soloLectura && encuestaActiva?.fechaRespuesta && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Respondida el{" "}
                                    {new Date(
                                        encuestaActiva.fechaRespuesta
                                    ).toLocaleDateString("es-CO")}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={cerrarModal}
                        disabled={enviando}
                        aria-label="Cerrar encuesta"
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="overflow-y-auto p-5 sm:p-6">
                    {cargando && (
                        <div className="flex flex-col items-center justify-center gap-3 py-12">
                            <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-red-600" />

                            <p className="text-sm text-gray-500">
                                Cargando encuesta...
                            </p>
                        </div>
                    )}

                    {!cargando && encuestaActiva && (
                        <>
                            {/* Aviso: encuesta ya realizada */}
                            {yaRespondida && (
                                <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                    <CheckCircle2
                                        size={18}
                                        className="mt-0.5 shrink-0 text-green-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-green-700">
                                            Encuesta ya realizada
                                        </p>

                                        <p className="text-xs text-green-600">
                                            Esta encuesta ya fue respondida y no
                                            puede modificarse. Aquí puedes
                                            consultar las respuestas.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <h3 className="text-center text-xl font-bold text-gray-800">
                                {encuestaActiva.plantilla?.titulo ||
                                    encuestaActiva.titulo ||
                                    "Encuesta"}
                            </h3>

                            {(encuestaActiva.plantilla?.descripcion ||
                                encuestaActiva.descripcion) && (
                                <p className="mt-2 text-center text-sm text-gray-500">
                                    {encuestaActiva.plantilla?.descripcion ||
                                        encuestaActiva.descripcion}
                                </p>
                            )}

                            {/* Progreso */}
                            <div className="my-6">
                                <div className="mb-2 flex justify-between text-xs font-semibold text-gray-500">
                                    <span>
                                        {soloLectura
                                            ? "Preguntas con respuesta"
                                            : "Progreso"}
                                    </span>

                                    <span>
                                        {respondidas} / {preguntas.length}
                                    </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-red-500 transition-all"
                                        style={{
                                            width: `${progreso}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Preguntas */}
                            {preguntas.length === 0 ? (
                                <div className="rounded-xl border border-gray-200 px-4 py-8 text-center">
                                    <p className="text-sm text-gray-500">
                                        Esta encuesta no contiene preguntas.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {preguntas.map((pregunta, index) => {
                                        const respuestaGuardada =
                                            encuestaActiva.respuestas?.find(
                                                (respuesta) =>
                                                    Number(
                                                        respuesta.pregunta_id
                                                    ) === Number(pregunta.id)
                                            );

                                        return (
                                            <div
                                                key={pregunta.id}
                                                className="rounded-xl border border-gray-200 p-4 sm:p-5"
                                            >
                                                <p className="mb-4 text-sm font-semibold text-gray-800">
                                                    {index + 1}. {pregunta.texto}
                                                </p>

                                                {soloLectura ? (
                                                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                            Respuesta registrada
                                                        </p>

                                                        <p className="text-sm font-medium text-slate-800">
                                                            {respuestaGuardada?.respuesta ??
                                                                "Sin respuesta registrada"}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {(
                                                            pregunta.OpcionesPregunta ||
                                                            []
                                                        ).map((opcion) => {
                                                            const seleccionada =
                                                                Number(
                                                                    respuestas[
                                                                        pregunta.id
                                                                    ]
                                                                ) ===
                                                                Number(opcion.id);

                                                            return (
                                                                <button
                                                                    key={opcion.id}
                                                                    type="button"
                                                                    disabled={enviando}
                                                                    onClick={() =>
                                                                        seleccionarOpcion(
                                                                            pregunta.id,
                                                                            opcion.id
                                                                        )
                                                                    }
                                                                    className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition ${
                                                                        seleccionada
                                                                            ? "border-red-400 bg-red-50 font-semibold text-red-700"
                                                                            : "border-gray-200 hover:border-red-200 hover:bg-gray-50"
                                                                    }`}
                                                                >
                                                                    <span className="flex items-center gap-3">
                                                                        <span
                                                                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                                                                seleccionada
                                                                                    ? "border-red-500"
                                                                                    : "border-gray-300"
                                                                            }`}
                                                                        >
                                                                            {seleccionada && (
                                                                                <span className="h-2 w-2 rounded-full bg-red-500" />
                                                                            )}
                                                                        </span>

                                                                        {opcion.texto}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 border-t bg-gray-50 p-4 sm:px-6">
                    <button
                        type="button"
                        onClick={cerrarModal}
                        disabled={enviando}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-white disabled:opacity-50"
                    >
                        {soloLectura ? "Cerrar" : "Cancelar"}
                    </button>

                    {!soloLectura && encuestaActiva && !cargando && (
                        <button
                            type="button"
                            onClick={handleEnviar}
                            disabled={enviando}
                            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {enviando
                                ? "Enviando..."
                                : "Enviar respuestas"}

                            {!enviando && (
                                <CheckCircle2 size={16} />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}