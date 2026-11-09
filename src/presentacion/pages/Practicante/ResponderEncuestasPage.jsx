import { useState, useEffect } from "react";
import {
    ArrowLeft,
    ArrowRight,
    ClipboardList,
    CheckCircle2,
    Check,
    Loader2,
    Send
} from "lucide-react";
import toast from "react-hot-toast";

import { obtenerEncuestasPracticante } from "../../../aplicacion/encuesta/obtenerEncuestasPracticante";
import { responderEncuestaPracticante } from "../../../aplicacion/encuesta/responderEncuestaPracticante";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository";


const MAX_TEXTO = 1000;

const AYUDA_TIPO = {
    opcion_unica: "Selecciona una opción.",
    opcion_multiple: "Puedes seleccionar varias opciones.",
    texto_libre: "Escribe tu respuesta con libertad."
};


// Las preguntas vienen dentro de la plantilla; las ordenamos por "orden"
const getPreguntas = (encuesta) =>
    [...(encuesta?.plantilla?.preguntas || [])]
        .sort((a, b) => a.orden - b.orden);

const getTipo = (pregunta) => pregunta.tipo ?? "opcion_unica";

// ¿La pregunta ya tiene una respuesta válida?
const estaRespondida = (pregunta, valor) => {
    switch (getTipo(pregunta)) {
        case "texto_libre":
            return typeof valor === "string" && valor.trim().length > 0;
        case "opcion_multiple":
            return Array.isArray(valor) && valor.length > 0;
        default:
            return valor !== undefined && valor !== null;
    }
};


export default function ResponderEncuestasPage() {

    const [encuestas, setEncuestas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // encuesta que se está contestando (null = mostrando el listado)
    const [encuestaActiva, setEncuestaActiva] = useState(null);

    // { [preguntaId]: opcionId | [opcionId] | "texto" }
    const [respuestas, setRespuestas] = useState({});

    // pregunta que se está viendo (paso a paso)
    const [indice, setIndice] = useState(0);

    const [enviando, setEnviando] = useState(false);


    useEffect(() => {
        cargarEncuestas();
    }, []);


    const cargarEncuestas = async () => {

        try {
            const data = await obtenerEncuestasPracticante({ encuestaRepository });
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
        setIndice(0);
        setEncuestaActiva(encuesta);
    }

    function volver() {
        if (enviando) return;
        setEncuestaActiva(null);
        setRespuestas({});
        setIndice(0);
    }


    // =============================
    // MANEJO DE RESPUESTAS
    // =============================

    function seleccionarUnica(preguntaId, opcionId) {
        setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
    }

    function alternarMultiple(preguntaId, opcionId) {
        setRespuestas((prev) => {
            const actuales = Array.isArray(prev[preguntaId]) ? prev[preguntaId] : [];

            const nuevas = actuales.includes(opcionId)
                ? actuales.filter((id) => id !== opcionId)
                : [...actuales, opcionId];

            return { ...prev, [preguntaId]: nuevas };
        });
    }

    function escribirTexto(preguntaId, texto) {
        setRespuestas((prev) => ({ ...prev, [preguntaId]: texto }));
    }


    // =============================
    // ENVIAR
    // =============================

    async function handleEnviar() {

        const preguntas = getPreguntas(encuestaActiva);

        const pendiente = preguntas.findIndex(
            (p) => !estaRespondida(p, respuestas[p.id])
        );

        if (pendiente !== -1) {
            toast.error("Debe responder todas las preguntas.");
            setIndice(pendiente);
            return;
        }

        // El backend espera el TEXTO de la opción elegida
        const payload = {
            practica_encuesta_id: encuestaActiva.id,
            respuestas: preguntas.map((p) => {

                const valor = respuestas[p.id];
                const opciones = p.OpcionesPregunta || [];

                const textoDe = (opcionId) =>
                    opciones.find((o) => Number(o.id) === Number(opcionId))?.texto;

                const tipo = getTipo(p);

                if (tipo === "texto_libre") {
                    return { pregunta_id: p.id, respuesta: valor.trim() };
                }

                if (tipo === "opcion_multiple") {
                    return {
                        pregunta_id: p.id,
                        respuesta: valor.map(textoDe).filter(Boolean)
                    };
                }

                return { pregunta_id: p.id, respuesta: textoDe(valor) };
            })
        };

        try {

            setEnviando(true);

            await responderEncuestaPracticante({ encuestaRepository }, payload);

            toast.success("Encuesta enviada correctamente");

            // Marcarla como respondida en el listado sin recargar
            setEncuestas((prev) =>
                prev.map((e) =>
                    e.id === encuestaActiva.id ? { ...e, respondida: true } : e
                )
            );

            setEnviando(false);
            volver();

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Ocurrió un error al enviar la encuesta"
            );

            setEnviando(false);

        }

    }



    // =============================
    // VISTA: RESPONDER (PASO A PASO)
    // =============================

    if (encuestaActiva) {

        const preguntas = getPreguntas(encuestaActiva);

        if (preguntas.length === 0) {
            return (
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-sm text-slate-500 mb-4">
                        Esta encuesta no tiene preguntas.
                    </p>
                    <button
                        type="button"
                        onClick={volver}
                        className="px-5 py-2 rounded-full border-2 border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                    >
                        Regresar
                    </button>
                </div>
            );
        }

        const pregunta = preguntas[indice];
        const tipo = getTipo(pregunta);
        const valor = respuestas[pregunta.id];

        const respondidas = preguntas.filter(
            (p) => estaRespondida(p, respuestas[p.id])
        ).length;

        const progreso = (respondidas / preguntas.length) * 100;
        const esUltima = indice === preguntas.length - 1;
        const actualRespondida = estaRespondida(pregunta, valor);

        // Se puede saltar a una pregunta solo si las anteriores están respondidas
        const puedeIrA = (i) =>
            preguntas.slice(0, i).every((p) => estaRespondida(p, respuestas[p.id]));

        return (

            <div className="max-w-2xl mx-auto">

                <button
                    type="button"
                    onClick={volver}
                    disabled={enviando}
                    className="inline-flex items-center gap-2 mb-5 text-sm font-semibold text-slate-600 hover:text-red-500 transition-colors disabled:opacity-50"
                >
                    <ArrowLeft size={18} />
                    Salir de la encuesta
                </button>

                <h1 className="text-[26px] font-extrabold text-slate-800 text-center tracking-tight mb-1">
                    {encuestaActiva.plantilla?.titulo}
                </h1>

                {encuestaActiva.plantilla?.descripcion && (
                    <p className="text-sm text-slate-500 text-center mb-6">
                        {encuestaActiva.plantilla.descripcion}
                    </p>
                )}


                {/* PROGRESO */}

                <div className="mb-5">

                    <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                        <span>Pregunta {indice + 1} de {preguntas.length}</span>
                        <span>{respondidas} respondidas</span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${progreso}%` }}
                        />
                    </div>

                    {/* PUNTOS DE NAVEGACIÓN */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {preguntas.map((p, i) => {

                            const hecha = estaRespondida(p, respuestas[p.id]);
                            const actual = i === indice;
                            const habilitado = puedeIrA(i);

                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    disabled={!habilitado || enviando}
                                    onClick={() => setIndice(i)}
                                    title={`Pregunta ${i + 1}`}
                                    className={`
                                        w-7 h-7 rounded-full text-xs font-bold
                                        flex items-center justify-center transition
                                        ${actual
                                            ? "bg-red-500 text-white ring-4 ring-red-100"
                                            : hecha
                                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                                : "bg-slate-100 text-slate-400"}
                                        ${!habilitado ? "cursor-not-allowed opacity-60" : ""}
                                    `}
                                >
                                    {hecha && !actual ? <Check size={13} /> : i + 1}
                                </button>
                            );
                        })}
                    </div>

                </div>


                {/* TARJETA DE LA PREGUNTA */}

                <div
                    key={pregunta.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8"
                >

                    <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-2">
                        Pregunta {indice + 1}
                    </p>

                    <h2 className="text-lg font-bold text-slate-800 leading-snug mb-1">
                        {pregunta.texto}
                    </h2>

                    <p className="text-xs text-slate-400 mb-5">
                        {AYUDA_TIPO[tipo]}
                    </p>


                    {/* TEXTO LIBRE */}

                    {tipo === "texto_libre" && (
                        <div>
                            <textarea
                                value={typeof valor === "string" ? valor : ""}
                                onChange={(e) => escribirTexto(pregunta.id, e.target.value)}
                                maxLength={MAX_TEXTO}
                                rows={6}
                                placeholder="Escribe tu respuesta aquí..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition"
                            />
                            <p className="text-right text-xs text-slate-400 mt-1">
                                {(typeof valor === "string" ? valor.length : 0)} / {MAX_TEXTO}
                            </p>
                        </div>
                    )}


                    {/* OPCIÓN ÚNICA / MÚLTIPLE */}

                    {tipo !== "texto_libre" && (
                        <div className="space-y-2.5">

                            {(pregunta.OpcionesPregunta || []).map((opcion) => {

                                const esMultiple = tipo === "opcion_multiple";

                                const seleccionada = esMultiple
                                    ? Array.isArray(valor) && valor.includes(opcion.id)
                                    : valor === opcion.id;

                                return (

                                    <button
                                        key={opcion.id}
                                        type="button"
                                        onClick={() =>
                                            esMultiple
                                                ? alternarMultiple(pregunta.id, opcion.id)
                                                : seleccionarUnica(pregunta.id, opcion.id)
                                        }
                                        className={`
                                            w-full flex items-center gap-3 text-left
                                            px-4 py-3.5 rounded-xl border-2 text-sm
                                            transition-all
                                            ${seleccionada
                                                ? "border-red-400 bg-red-50 text-red-700 font-semibold shadow-sm"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:bg-slate-50"}
                                        `}
                                    >

                                        {/* Indicador: círculo (única) o cuadro (múltiple) */}
                                        <span
                                            className={`
                                                w-5 h-5 shrink-0 border-2
                                                flex items-center justify-center
                                                ${esMultiple ? "rounded-md" : "rounded-full"}
                                                ${seleccionada
                                                    ? "border-red-500 bg-red-500"
                                                    : "border-slate-300 bg-white"}
                                            `}
                                        >
                                            {seleccionada && (
                                                esMultiple
                                                    ? <Check size={13} className="text-white" strokeWidth={3} />
                                                    : <span className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </span>

                                        <span className="break-words">{opcion.texto}</span>

                                    </button>

                                );

                            })}

                        </div>
                    )}

                </div>


                {/* NAVEGACIÓN */}

                <div className="flex items-center justify-between gap-3 mt-6">

                    <button
                        type="button"
                        onClick={() => setIndice((i) => i - 1)}
                        disabled={indice === 0 || enviando}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={16} />
                        Anterior
                    </button>

                    {esUltima ? (

                        <button
                            type="button"
                            onClick={handleEnviar}
                            disabled={!actualRespondida || enviando}
                            className="inline-flex items-center justify-center gap-2 min-w-[170px] px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {enviando ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send size={16} />
                                    Enviar respuestas
                                </>
                            )}
                        </button>

                    ) : (

                        <button
                            type="button"
                            onClick={() => setIndice((i) => i + 1)}
                            disabled={!actualRespondida}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                            <ArrowRight size={16} />
                        </button>

                    )}

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
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                    <Loader2 size={18} className="animate-spin" />
                    Cargando encuestas...
                </div>
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

                {encuestas.map((encuesta) => (

                    <div
                        key={encuesta.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex items-center justify-between gap-4"
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