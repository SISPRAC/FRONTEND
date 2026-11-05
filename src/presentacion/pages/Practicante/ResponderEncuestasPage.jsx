import { useState, useEffect } from "react";
import { ArrowLeft, ClipboardList, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

import { obtenerEncuestasPracticante } from "../../../aplicacion/encuesta/obtenerEncuestasPracticante";
// TODO: crear este caso de uso (ver nota al final)
import { responderEncuestaPracticante } from "../../../aplicacion/encuesta/responderEncuestaPracticante";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository";


// Las preguntas vienen dentro de la plantilla; las ordenamos por "orden"
const getPreguntas = encuesta =>
    [...(encuesta?.plantilla?.preguntas || [])]
        .sort((a, b) => a.orden - b.orden);


export default function ResponderEncuestasPage() {

    const [encuestas, setEncuestas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // encuesta que se está contestando (null = mostrando el listado)
    const [encuestaActiva, setEncuestaActiva] = useState(null);

    // { [preguntaId]: opcionId }
    const [respuestas, setRespuestas] = useState({});
    const [enviando, setEnviando] = useState(false);


    useEffect(() => {
        cargarEncuestas();
    }, []);


    const cargarEncuestas = async () => {

        try {

            const data = await obtenerEncuestasPracticante({ encuestaRepository });

            console.log("encuesta", data);

            setEncuestas(data || []);

        } catch (error) {

            console.error(error);
            toast.error("No se pudieron cargar las encuestas");

        } finally {

            setCargando(false);

        }

    };


    function abrirEncuesta(encuesta) {
        setRespuestas({});
        setEncuestaActiva(encuesta);
    }


    function volver() {
        setEncuestaActiva(null);
        setRespuestas({});
    }


    function seleccionarOpcion(preguntaId, opcionId) {
        setRespuestas(prev => ({ ...prev, [preguntaId]: opcionId }));
    }



    async function handleEnviar() {

        const preguntas = getPreguntas(encuestaActiva);

        if (Object.keys(respuestas).length < preguntas.length) {
            toast.error("Debe responder todas las preguntas.");
            return;
        }

        const payload = {
            practica_encuesta_id: encuestaActiva.id,
            respuestas: preguntas.map(p => {
                const opcionSeleccionada = (p.OpcionesPregunta || []).find(
                    opcion => Number(opcion.id) === Number(respuestas[p.id])
                );

                return {
                    pregunta_id: p.id,
                    respuesta: opcionSeleccionada?.texto
                };
            })
        };

        try {

            setEnviando(true);

            await responderEncuestaPracticante(
                { encuestaRepository },
                payload
            );

            toast.success("Encuesta enviada correctamente");

            // Marcarla como respondida en el listado sin recargar
            setEncuestas(prev =>
                prev.map(e =>
                    e.id === encuestaActiva.id
                        ? { ...e, respondida: true }
                        : e
                )
            );

            volver();

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Ocurrió un error al enviar la encuesta"
            );

        } finally {

            setEnviando(false);

        }

    }



    // =============================
    // VISTA: RESPONDER
    // =============================

    if (encuestaActiva) {

        const preguntas = getPreguntas(encuestaActiva);
        const respondidas = Object.keys(respuestas).length;
        const progreso = preguntas.length
            ? (respondidas / preguntas.length) * 100
            : 0;

        return (

            <div className="max-w-3xl mx-auto">

                <button
                    type="button"
                    onClick={volver}
                    className="inline-flex items-center gap-2 mb-5 text-sm font-semibold text-slate-600 hover:text-red-500 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Regresar
                </button>

                <h1 className="text-[26px] font-extrabold text-slate-800 text-center tracking-tight mb-2">
                    {encuestaActiva.plantilla?.titulo}
                </h1>

                <p className="text-sm text-slate-500 text-center mb-6">
                    {encuestaActiva.plantilla?.descripcion}
                </p>


                {/* PROGRESO */}

                <div className="mb-6">

                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>Progreso</span>
                        <span>{respondidas} / {preguntas.length}</span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>

                </div>


                {/* PREGUNTAS */}

                <div className="space-y-5">

                    {preguntas.map((pregunta, index) => (

                        <div
                            key={pregunta.id}
                            className="bg-white rounded-2xl border-2 border-red-200 p-6"
                        >

                            <p className="text-sm font-bold text-slate-800 mb-4">
                                {index + 1}. {pregunta.texto}
                            </p>

                            <div className="space-y-2">

                                {(pregunta.OpcionesPregunta || []).map(opcion => {

                                    const seleccionada =
                                        respuestas[pregunta.id] === opcion.id;

                                    return (

                                        <button
                                            key={opcion.id}
                                            type="button"
                                            onClick={() =>
                                                seleccionarOpcion(pregunta.id, opcion.id)
                                            }
                                            className={`
                                                w-full flex items-center gap-3 text-left
                                                px-4 py-3 rounded-xl border-2 text-sm
                                                transition-colors
                                                ${seleccionada
                                                    ? "border-red-400 bg-red-50 text-red-600 font-semibold"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-slate-50"}
                                            `}
                                        >

                                            <span
                                                className={`
                                                    w-4 h-4 rounded-full border-2 shrink-0
                                                    flex items-center justify-center
                                                    ${seleccionada ? "border-red-500" : "border-slate-300"}
                                                `}
                                            >
                                                {seleccionada && (
                                                    <span className="w-2 h-2 rounded-full bg-red-500" />
                                                )}
                                            </span>

                                            {opcion.texto}

                                        </button>

                                    );

                                })}

                            </div>

                        </div>

                    ))}

                </div>


                {/* BOTONES */}

                <div className="flex justify-end gap-3 mt-8">

                    <button
                        type="button"
                        onClick={volver}
                        className="px-6 py-2.5 rounded-full border-2 border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleEnviar}
                        disabled={enviando}
                        className="px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {enviando ? "Enviando..." : "Enviar respuestas"}
                    </button>

                </div>

            </div>

        );

    }


    // =============================
    // VISTA: LISTADO
    // =============================

    return (

        <div className="max-w-3xl mx-auto">

            <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-7 tracking-tight">
                Mis Encuestas
            </h1>

            {cargando && (
                <p className="text-center text-sm text-slate-400">
                    Cargando encuestas...
                </p>
            )}

            {!cargando && encuestas.length === 0 && (
                <div className="bg-white rounded-2xl border-2 border-red-200 py-12 text-center">
                    <ClipboardList size={32} className="mx-auto text-red-300 mb-3" />
                    <p className="text-sm text-slate-500">
                        No tienes encuestas pendientes.
                    </p>
                </div>
            )}

            <div className="space-y-4">

                {encuestas.map(encuesta => (

                    <div
                        key={encuesta.id}
                        className="bg-white rounded-2xl border-2 border-red-200 p-5 flex items-center justify-between gap-4"
                    >

                        <div className="min-w-0">

                            <h2 className="text-base font-bold text-slate-800 truncate">
                                {encuesta.plantilla?.titulo}
                            </h2>

                            <p className="text-sm text-slate-500 line-clamp-2 mt-0.5">
                                {encuesta.plantilla?.descripcion}
                            </p>

                            <span className="inline-block mt-2 text-xs font-medium text-slate-400">
                                {getPreguntas(encuesta).length} preguntas
                            </span>

                        </div>

                        {encuesta.respondida ? (

                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 shrink-0">
                                <CheckCircle2 size={16} />
                                Respondida
                            </span>

                        ) : (

                            <button
                                type="button"
                                onClick={() => abrirEncuesta(encuesta)}
                                className="px-5 py-2 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm shrink-0"
                            >
                                Responder
                            </button>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );

}