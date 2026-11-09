import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Plus,
    X,
    Paperclip,
    File,
    ArrowLeft,
    CircleDot,
    ListChecks,
    AlignLeft,
    Loader2
} from "lucide-react";

import { getEncuesta } from "../../../aplicacion/encuesta/getEncuesta";
import { crearEncuesta } from "../../../aplicacion/encuesta/crearEncuesta";
import { actualizarEncuesta } from "../../../aplicacion/encuesta/editarEncuesta";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository";

import toast from "react-hot-toast";
import * as mammoth from "mammoth";


const ROLES = [
    "Tutor Docente",
    "Tutor Empresarial",
    "Practicante"
];

const TIPOS = [
    {
        value: "opcion_unica",
        label: "Opción única",
        ayuda: "El usuario elige una sola opción.",
        icon: CircleDot
    },
    {
        value: "opcion_multiple",
        label: "Opción múltiple",
        ayuda: "El usuario puede elegir varias opciones.",
        icon: ListChecks
    },
    {
        value: "texto_libre",
        label: "Texto libre",
        ayuda: "El usuario responde escribiendo.",
        icon: AlignLeft
    }
];

const inputBase =
    "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300 transition";


let idCounter = 0;

const uid = () => `id-${++idCounter}-${Date.now()}`;


function nuevaPreguntaVacia() {
    return {
        id: uid(),
        texto: "",
        orden: 1,
        tipo: "opcion_unica",
        opciones: []
    };
}

function normalizarPregunta(pregunta) {
    return {
        id: pregunta.id,
        texto: pregunta.texto || "",
        orden: pregunta.orden,
        tipo: pregunta.tipo ?? "opcion_unica",
        opciones:
            pregunta.OpcionesPregunta?.map((opcion) => ({
                id: opcion.id,
                texto: opcion.texto || ""
            })) || []
    };
}

function interpretarTipo(valor) {
    const v = valor.toLowerCase();

    if (v.includes("libre") || v.includes("abierta")) return "texto_libre";
    if (v.includes("múltiple") || v.includes("multiple")) return "opcion_multiple";

    return "opcion_unica";
}


export default function AgregarEncuestaPage() {

    const navigate = useNavigate();
    const { id } = useParams();

    const modo = id ? "editar" : "crear";

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [rol, setRol] = useState("");
    const [preguntas, setPreguntas] = useState([nuevaPreguntaVacia()]);
    const [archivoNombre, setArchivoNombre] = useState("");
    const [cargando, setCargando] = useState(Boolean(id));
    const [guardando, setGuardando] = useState(false);


    // =============================
    // CARGAR ENCUESTA SI EDITA
    // =============================

    useEffect(() => {
        if (id) cargarEncuesta();
    }, [id]);

    const cargarEncuesta = async () => {
        try {
            const encuesta = await getEncuesta({ encuestaRepository }, id);

            setTitulo(encuesta.titulo || "");
            setDescripcion(encuesta.descripcion || "");
            setRol(encuesta.Role?.nombre || "");

            const preguntasEncuesta = encuesta.preguntas || [];

            setPreguntas(
                preguntasEncuesta.length === 0
                    ? [nuevaPreguntaVacia()]
                    : preguntasEncuesta.map(normalizarPregunta)
            );

        } catch (error) {
            console.error(error);
            toast.error("No se pudo cargar la encuesta");
        } finally {
            setCargando(false);
        }
    };


    // =============================
    // PREGUNTAS
    // =============================

    function actualizarTextoPregunta(preguntaId, texto) {
        setPreguntas((prev) =>
            prev.map((p) => (p.id === preguntaId ? { ...p, texto } : p))
        );
    }

    function cambiarTipoPregunta(preguntaId, nuevoTipo) {
        const pregunta = preguntas.find((p) => p.id === preguntaId);

        if (!pregunta || pregunta.tipo === nuevoTipo) return;

        if (
            nuevoTipo === "texto_libre" &&
            pregunta.opciones.length > 0 &&
            !window.confirm(
                "Al cambiar a texto libre se eliminarán las opciones de esta pregunta. ¿Continuar?"
            )
        ) {
            return;
        }

        setPreguntas((prev) =>
            prev.map((p) =>
                p.id === preguntaId
                    ? {
                        ...p,
                        tipo: nuevoTipo,
                        opciones: nuevoTipo === "texto_libre" ? [] : p.opciones
                    }
                    : p
            )
        );
    }

    function agregarOpcion(preguntaId, texto) {
        if (!texto.trim()) return;

        setPreguntas((prev) =>
            prev.map((p) =>
                p.id === preguntaId
                    ? {
                        ...p,
                        opciones: [...p.opciones, { id: uid(), texto: texto.trim() }]
                    }
                    : p
            )
        );
    }

    function eliminarOpcion(preguntaId, opcionId) {
        setPreguntas((prev) =>
            prev.map((p) =>
                p.id === preguntaId
                    ? { ...p, opciones: p.opciones.filter((o) => o.id !== opcionId) }
                    : p
            )
        );
    }

    function agregarBloquePregunta() {
        setPreguntas((prev) => [...prev, nuevaPreguntaVacia()]);
    }

    function eliminarBloquePregunta(preguntaId) {
        setPreguntas((prev) =>
            prev.length === 1 ? prev : prev.filter((p) => p.id !== preguntaId)
        );
    }


    // =============================
    // CARGAR ARCHIVO WORD
    // =============================

    async function handleArchivoSeleccionado(e) {

        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".docx")) {
            toast.error("Solo se permiten archivos de Word (.docx).");
            e.target.value = "";
            return;
        }

        setArchivoNombre(file.name);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const { value } = await mammoth.extractRawText({ arrayBuffer });

            const encuesta = parsearDocumento(value);

            if (!encuesta.titulo.trim()) {
                toast.error("El documento no contiene un título.");
                return;
            }

            if (!encuesta.descripcion.trim()) {
                toast.error("El documento no contiene una descripción.");
                return;
            }

            if (!encuesta.rol.trim()) {
                toast.error("El documento no contiene un rol.");
                return;
            }

            if (encuesta.preguntas.length === 0) {
                toast.error("No se encontraron preguntas válidas.");
                return;
            }

            if (!ROLES.includes(encuesta.rol)) {
                toast.error("El rol indicado en el documento no es válido.");
                return;
            }

            setTitulo(encuesta.titulo);
            setDescripcion(encuesta.descripcion);
            setRol(encuesta.rol);
            setPreguntas(encuesta.preguntas);

        } catch (err) {
            console.error(err);
            toast.error("No se pudo leer el documento.");
        }

        e.target.value = "";
    }


    // =============================
    // PARSEAR DOCUMENTO
    // =============================
    // Formato soportado (la línea "Tipo:" es opcional):
    //
    //   Pregunta:
    //   ¿Cómo calificas el ambiente?
    //   Tipo: opción única | opción múltiple | texto libre
    //   A) Bueno
    //   B) Malo

    function parsearDocumento(texto) {

        const lineas = texto
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l !== "");

        const encuesta = {
            titulo: "",
            descripcion: "",
            rol: "",
            preguntas: []
        };

        let preguntaActual = null;
        let esperandoPregunta = false;

        for (let i = 0; i < lineas.length; i++) {

            const linea = lineas[i];
            const minuscula = linea.toLowerCase();

            if (minuscula === "título:" || minuscula === "titulo:") {
                encuesta.titulo = lineas[++i] || "";
                continue;
            }

            if (minuscula === "descripción:" || minuscula === "descripcion:") {
                encuesta.descripcion = lineas[++i] || "";
                continue;
            }

            if (minuscula === "rol:") {
                encuesta.rol = lineas[++i] || "";
                continue;
            }

            if (minuscula === "pregunta:") {
                esperandoPregunta = true;
                continue;
            }

            if (esperandoPregunta) {
                preguntaActual = {
                    id: uid(),
                    texto: linea,
                    orden: encuesta.preguntas.length + 1,
                    tipo: "opcion_unica",
                    opciones: []
                };

                encuesta.preguntas.push(preguntaActual);
                esperandoPregunta = false;
                continue;
            }

            const matchTipo = linea.match(/^tipo:\s*(.+)$/i);

            if (matchTipo && preguntaActual) {
                preguntaActual.tipo = interpretarTipo(matchTipo[1]);
                continue;
            }

            if (/^[A-Z]\)/.test(linea) && preguntaActual) {
                preguntaActual.opciones.push({
                    id: uid(),
                    texto: linea.replace(/^[A-Z]\)\s*/, "")
                });
            }
        }

        encuesta.preguntas = encuesta.preguntas
            .map((p) =>
                p.tipo === "texto_libre" ? { ...p, opciones: [] } : p
            )
            .filter((p) => p.tipo === "texto_libre" || p.opciones.length >= 2);

        return encuesta;
    }


    // =============================
    // VALIDAR
    // =============================

    function validar() {

        if (!titulo.trim()) return "Debe ingresar el título de la encuesta.";
        if (!descripcion.trim()) return "Debe ingresar la descripción de la encuesta.";
        if (!rol) return "Debe seleccionar el rol a encuestar.";
        if (preguntas.length === 0) return "Debe agregar al menos una pregunta.";

        for (const pregunta of preguntas) {

            if (!pregunta.texto.trim()) {
                return "Todas las preguntas deben tener un enunciado.";
            }

            if (pregunta.tipo === "texto_libre") continue;

            if (pregunta.opciones.length < 2) {
                return `La pregunta "${pregunta.texto}" debe tener al menos dos opciones.`;
            }

            if (pregunta.opciones.some((o) => !o.texto.trim())) {
                return `La pregunta "${pregunta.texto}" tiene opciones vacías.`;
            }
        }

        return "";
    }


    // =============================
    // GUARDAR
    // =============================

    async function handleGuardar() {

        if (guardando) return;

        const mensajeError = validar();

        if (mensajeError) {
            toast.error(mensajeError);
            return;
        }

        const preguntasPayload = preguntas.map((p, index) => ({
            id: typeof p.id === "number" ? p.id : null,
            texto: p.texto.trim(),
            orden: index + 1,
            tipo: p.tipo,
            opciones:
                p.tipo === "texto_libre"
                    ? []
                    : p.opciones.map((op) => ({
                        id: typeof op.id === "number" ? op.id : null,
                        texto: op.texto.trim()
                    }))
        }));

        const payload = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim(),
            rol,
            preguntas: preguntasPayload
        };

        try {
            setGuardando(true);

            if (modo === "crear") {
                await crearEncuesta({ encuestaRepository }, payload);
                toast.success("Encuesta creada correctamente");
            } else {
                await actualizarEncuesta({ encuestaRepository }, id, payload);
                toast.success("Encuesta actualizada correctamente");
            }

            navigate(-1);

        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Ocurrió un error al guardar la encuesta"
            );

        } finally {
            setGuardando(false);
        }
    }

    function handleCancelar() {
        navigate(-1);
    }


    // =============================
    // RENDER
    // =============================

    if (cargando) {
        return (
            <div className="flex items-center justify-center py-24 text-slate-500">
                <Loader2 size={28} className="animate-spin" />
            </div>
        );
    }

    return (

        <div className="max-w-4xl mx-auto pb-28">

            <button
                type="button"
                onClick={handleCancelar}
                className="inline-flex items-center gap-2 mb-5 text-sm font-semibold text-slate-600 hover:text-red-500 transition-colors"
            >
                <ArrowLeft size={18} />
                Regresar
            </button>

            <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-7 tracking-tight">
                {modo === "editar" ? "Editar Encuesta" : "Agregar Encuesta"}
            </h1>


            {/* =============================
                DATOS GENERALES
            ============================== */}

            <section className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm">

                <div className="flex items-start justify-between gap-4 mb-5">

                    <div>
                        <h2 className="text-base font-bold text-slate-800">
                            Información general
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Puedes llenarla a mano o cargar un documento de Word.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">

                        <label
                            title={archivoNombre}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold cursor-pointer hover:bg-red-700 transition-colors"
                        >
                            <Paperclip size={15} />

                            <span className="truncate max-w-[150px]">
                                {archivoNombre || "Adjuntar documento"}
                            </span>

                            <input
                                type="file"
                                accept=".docx"
                                hidden
                                onChange={handleArchivoSeleccionado}
                            />
                        </label>

                        <a
                            href="/plantillas/Plantilla_Encuesta.docx"
                            download
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold bg-white hover:bg-slate-50 transition-colors"
                        >
                            <File size={15} />
                            Descargar plantilla
                        </a>

                    </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div className="md:col-span-2">
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                            Título de la encuesta
                        </label>
                        <input
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Digite el título de la encuesta"
                            className={inputBase}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                            Rol a encuestar
                        </label>
                        <select
                            value={rol}
                            onChange={(e) => setRol(e.target.value)}
                            className={inputBase}
                        >
                            <option value="">Seleccionar rol</option>
                            {ROLES.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                            Descripción de la encuesta
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Digite la descripción de la encuesta"
                            rows={2}
                            className={`${inputBase} resize-none`}
                        />
                    </div>

                </div>

            </section>


            {/* =============================
                PREGUNTAS
            ============================== */}

            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-800">
                    Preguntas
                    <span className="ml-2 text-xs font-semibold text-slate-400">
                        {preguntas.length}
                    </span>
                </h2>
            </div>

            <div className="space-y-4">

                {preguntas.map((pregunta, index) => (
                    <BloquePregunta
                        key={pregunta.id}
                        numero={index + 1}
                        pregunta={pregunta}
                        puedeEliminar={preguntas.length > 1}
                        onCambiarTexto={(texto) =>
                            actualizarTextoPregunta(pregunta.id, texto)
                        }
                        onCambiarTipo={(tipo) =>
                            cambiarTipoPregunta(pregunta.id, tipo)
                        }
                        onAgregarOpcion={(texto) =>
                            agregarOpcion(pregunta.id, texto)
                        }
                        onEliminarOpcion={(opcionId) =>
                            eliminarOpcion(pregunta.id, opcionId)
                        }
                        onEliminarBloque={() =>
                            eliminarBloquePregunta(pregunta.id)
                        }
                    />
                ))}

                <button
                    type="button"
                    onClick={agregarBloquePregunta}
                    className="w-full rounded-2xl border-2 border-dashed border-red-200 hover:border-red-300 hover:bg-red-50/50 transition-colors py-6 flex items-center justify-center gap-2 text-red-500 text-sm font-semibold"
                >
                    <Plus size={18} />
                    Agregar pregunta
                </button>

            </div>


            {/* =============================
                BARRA DE ACCIONES
            ============================== */}

            <div className="fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200">
                <div className="max-w-4xl mx-auto px-4 py-3 flex justify-end gap-3">

                    <button
                        type="button"
                        onClick={handleCancelar}
                        disabled={guardando}
                        className="px-6 py-2.5 rounded-full border-2 border-slate-300 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleGuardar}
                        disabled={guardando}
                        className="inline-flex items-center justify-center gap-2 min-w-[120px] px-6 py-2.5 rounded-full bg-red-500 text-white text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {guardando ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar"
                        )}
                    </button>

                </div>
            </div>

        </div>
    );
}


// ======================================================
// BLOQUE PREGUNTA
// ======================================================

function BloquePregunta({
    numero,
    pregunta,
    puedeEliminar,
    onCambiarTexto,
    onCambiarTipo,
    onAgregarOpcion,
    onEliminarOpcion,
    onEliminarBloque
}) {

    const [opcionInput, setOpcionInput] = useState("");

    const esTextoLibre = pregunta.tipo === "texto_libre";

    const tipoActual = TIPOS.find((t) => t.value === pregunta.tipo);

    function confirmarOpcion() {
        onAgregarOpcion(opcionInput);
        setOpcionInput("");
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            confirmarOpcion();
        }
    }

    return (

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* CABECERA */}

            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200">

                <div className="flex items-center gap-3">

                    <span className="w-7 h-7 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                        {numero}
                    </span>

                    <div className="inline-flex rounded-lg bg-slate-200/70 p-0.5">
                        {TIPOS.map(({ value, label, icon: Icon }) => {

                            const activo = pregunta.tipo === value;

                            return (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => onCambiarTipo(value)}
                                    className={`
                                        inline-flex items-center gap-1.5
                                        px-3 py-1.5 rounded-md
                                        text-xs font-semibold transition
                                        ${activo
                                            ? "bg-white text-red-600 shadow-sm"
                                            : "text-slate-500 hover:text-slate-700"}
                                    `}
                                >
                                    <Icon size={14} />
                                    <span className="hidden sm:inline">{label}</span>
                                </button>
                            );
                        })}
                    </div>

                </div>

                {puedeEliminar && (
                    <button
                        type="button"
                        onClick={onEliminarBloque}
                        title="Eliminar pregunta"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <X size={16} />
                    </button>
                )}

            </div>


            {/* CUERPO */}

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* PREGUNTA */}

                <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                        Enunciado
                    </label>

                    <textarea
                        value={pregunta.texto}
                        onChange={(e) => onCambiarTexto(e.target.value)}
                        placeholder="Digite la pregunta"
                        rows={4}
                        className={`${inputBase} bg-slate-50 resize-none`}
                    />

                    <p className="text-xs text-slate-400 mt-1.5">
                        {tipoActual?.ayuda}
                    </p>
                </div>


                {/* RESPUESTAS */}

                <div>

                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                        {esTextoLibre ? "Respuesta" : "Opciones de respuesta"}
                    </label>

                    {esTextoLibre ? (

                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                            <div className="h-16 flex items-start gap-2 text-sm text-slate-400 italic">
                                <AlignLeft size={16} className="mt-0.5 shrink-0" />
                                Aquí el usuario escribirá su respuesta.
                            </div>
                        </div>

                    ) : (

                        <>
                            {pregunta.opciones.length > 0 && (
                                <ul className="space-y-1.5 mb-3">
                                    {pregunta.opciones.map((op, i) => (
                                        <li
                                            key={op.id}
                                            className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg pl-2 pr-1.5 py-1.5"
                                        >
                                            <span className="w-6 h-6 shrink-0 rounded-md bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center">
                                                {String.fromCharCode(65 + (i % 26))}
                                            </span>

                                            <span className="flex-1 text-sm text-slate-700 break-words">
                                                {op.texto}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() => onEliminarOpcion(op.id)}
                                                title="Quitar opción"
                                                className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <div className="flex gap-2">

                                <input
                                    type="text"
                                    value={opcionInput}
                                    onChange={(e) => setOpcionInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Escribe una opción y presiona Enter"
                                    className={inputBase}
                                />

                                <button
                                    type="button"
                                    onClick={confirmarOpcion}
                                    title="Agregar opción"
                                    className="shrink-0 w-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors"
                                >
                                    <Plus size={18} />
                                </button>

                            </div>

                            {pregunta.opciones.length < 2 && (
                                <p className="text-xs text-amber-600 mt-1.5">
                                    Agrega al menos 2 opciones.
                                </p>
                            )}
                        </>
                    )}

                </div>

            </div>

        </div>
    );
}