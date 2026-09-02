import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Plus,
    X,
    Paperclip,
    ChevronDown,
    File,
    ArrowLeft
} from "lucide-react";

import Layout from "../../shared/Layouts/Layout";

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


let idCounter = 0;


const uid = () =>
    `id-${++idCounter}-${Date.now()}`;


function nuevaPreguntaVacia() {

    return {

        id: uid(),

        texto: "",

        orden: 1,

        opciones: []

    };

}


export default function AgregarEncuestaPage() {


    const navigate = useNavigate();

    const { id } = useParams();


    // =============================
    // DATOS DE LA ENCUESTA
    // =============================

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [rol, setRol] = useState("");

    const [modo, setModo] = useState("crear");

    const [menuRolAbierto, setMenuRolAbierto] = useState(false);

    const [preguntas, setPreguntas] = useState([
        nuevaPreguntaVacia()
    ]);

    const [archivoNombre, setArchivoNombre] = useState("");
    const [error, setError] = useState("");

    const fileInputRef =
        useRef(null);


    // =============================
    // CARGAR ENCUESTA SI EDITA
    // =============================

    useEffect(() => {

        if (id) {

            cargarEncuesta();

        }

    }, [id]);



    // =============================
    // CARGAR ENCUESTA
    // =============================

    const cargarEncuesta = async () => {

        try {

            const encuesta =
                await getEncuesta(
                    {
                        encuestaRepository
                    },
                    id
                );


            setModo("editar");

            // =============================
            // DATOS GENERALES
            // =============================

            setTitulo(
                encuesta.titulo || ""
            );

            setDescripcion(
                encuesta.descripcion || ""
            );

            setRol(
                encuesta.Role?.nombre || ""
            );

            // =============================
            // PREGUNTAS
            // =============================

            const preguntasEncuesta =
                encuesta.preguntas || [];

            if (preguntasEncuesta.length === 0) {

                setPreguntas([
                    nuevaPreguntaVacia()
                ]);

            } else {

                setPreguntas(

                    preguntasEncuesta.map(
                        pregunta => ({

                            id: pregunta.id,

                            texto:
                                pregunta.texto || "",

                            orden:
                                pregunta.orden,

                            opciones:
                                pregunta.OpcionesPregunta?.map(
                                    opcion => ({

                                        id: opcion.id,

                                        texto:
                                            opcion.texto || ""

                                    })
                                ) || []

                        })
                    )

                );

            }

        } catch (error) {

            console.error(error);

            toast.error(
                "No se pudo cargar la encuesta"
            );

        }

    };


    // =============================
    // CARGAR PREGUNTAS
    // =============================

    const cargarPreguntas = (
        periodoPlantilla
    ) => {

        const preguntasActuales =
            periodoPlantilla.preguntas || [];


        if (
            preguntasActuales.length === 0
        ) {

            setPreguntas([
                nuevaPreguntaVacia()
            ]);

            return;

        }


        setPreguntas(

            preguntasActuales.map(
                pregunta => ({

                    id: pregunta.id,

                    texto:
                        pregunta.texto || "",

                    orden:
                        pregunta.orden,

                    opciones:
                        pregunta.OpcionesPregunta?.map(
                            opcion => ({

                                id: opcion.id,

                                texto:
                                    opcion.texto || ""

                            })
                        ) || []

                })
            )

        );

    };


    // =============================
    // CAMBIAR TEXTO PREGUNTA
    // =============================

    function actualizarTextoPregunta(
        id,
        texto
    ) {

        setPreguntas(

            prev =>

                prev.map(

                    p =>

                        p.id === id

                            ?

                            {
                                ...p,
                                texto
                            }

                            :

                            p

                )

        );

    }


    // =============================
    // AGREGAR OPCIÓN
    // =============================

    function agregarOpcion(
        preguntaId,
        texto
    ) {

        if (
            !texto.trim()
        ) return;


        setPreguntas(

            prev =>

                prev.map(

                    p =>

                        p.id === preguntaId

                            ?

                            {

                                ...p,

                                opciones: [

                                    ...p.opciones,

                                    {

                                        id: uid(),

                                        texto:
                                            texto.trim()

                                    }

                                ]

                            }

                            :

                            p

                )

        );

    }


    // =============================
    // ELIMINAR OPCIÓN
    // =============================

    function eliminarOpcion(
        preguntaId,
        opcionId
    ) {

        setPreguntas(

            prev =>

                prev.map(

                    p =>

                        p.id === preguntaId

                            ?

                            {

                                ...p,

                                opciones:
                                    p.opciones.filter(

                                        o =>
                                            o.id !== opcionId

                                    )

                            }

                            :

                            p

                )

        );

    }


    // =============================
    // AGREGAR PREGUNTA
    // =============================

    function agregarBloquePregunta() {

        setPreguntas(

            prev => [

                ...prev,

                nuevaPreguntaVacia()

            ]

        );

    }


    // =============================
    // ELIMINAR PREGUNTA
    // =============================

    function eliminarBloquePregunta(
        id
    ) {

        setPreguntas(

            prev =>

                prev.length === 1

                    ?

                    prev

                    :

                    prev.filter(
                        p =>
                            p.id !== id
                    )

        );

    }


    // =============================
    // CARGAR ARCHIVO WORD
    // =============================

    async function handleArchivoSeleccionado(
        e
    ) {

        const file =
            e.target.files?.[0];


        if (!file) return;


        if (
            !file.name
                .toLowerCase()
                .endsWith(".docx")
        ) {

            toast.error(
                "Solo se permiten archivos de Word (.docx)."
            );


            e.target.value = "";

            return;

        }


        setError("");

        setArchivoNombre(
            file.name
        );


        try {

            const arrayBuffer =
                await file.arrayBuffer();


            const { value } =
                await mammoth.extractRawText({

                    arrayBuffer

                });


            const encuesta =
                parsearDocumento(
                    value
                );



            if (
                !encuesta.titulo.trim()
            ) {

                toast.error(
                    "El documento no contiene un título."
                );

                return;

            }


            if (
                !encuesta.descripcion.trim()
            ) {

                toast.error(
                    "El documento no contiene una descripción."
                );

                return;

            }


            if (
                !encuesta.rol.trim()
            ) {

                toast.error(
                    "El documento no contiene un rol."
                );

                return;

            }


            if (
                encuesta.preguntas.length === 0
            ) {

                toast.error(
                    "No se encontraron preguntas válidas."
                );

                return;

            }


            if (
                !ROLES.includes(
                    encuesta.rol
                )
            ) {

                toast.error(
                    "El rol indicado en el documento no es válido."
                );

                return;

            }


            setTitulo(
                encuesta.titulo
            );


            setDescripcion(
                encuesta.descripcion
            );


            setRol(
                encuesta.rol
            );


            setPreguntas(
                encuesta.preguntas
            );


        } catch (err) {

            console.error(
                err
            );


            toast.error(
                "No se pudo leer el documento."
            );

        }


        e.target.value = "";

    }


    // =============================
    // PARSEAR DOCUMENTO
    // =============================

    function parsearDocumento(
        texto
    ) {

        const lineas =
            texto

                .split(/\r?\n/)

                .map(
                    l =>
                        l.trim()
                )

                .filter(
                    l =>
                        l !== ""
                );


        const encuesta = {

            titulo: "",

            descripcion: "",

            rol: "",

            preguntas: []

        };


        let preguntaActual =
            null;


        let esperandoPregunta =
            false;


        for (
            let i = 0;
            i < lineas.length;
            i++
        ) {

            const linea =
                lineas[i];


            if (

                linea.toLowerCase() ===
                "título:"

                ||

                linea.toLowerCase() ===
                "titulo:"

            ) {

                encuesta.titulo =
                    lineas[++i] || "";

                continue;

            }


            if (

                linea.toLowerCase() ===
                "descripción:"

                ||

                linea.toLowerCase() ===
                "descripcion:"

            ) {

                encuesta.descripcion =
                    lineas[++i] || "";

                continue;

            }


            if (
                linea.toLowerCase() ===
                "rol:"
            ) {

                encuesta.rol =
                    lineas[++i] || "";

                continue;

            }


            if (
                linea.toLowerCase() ===
                "pregunta:"
            ) {

                esperandoPregunta =
                    true;

                continue;

            }


            if (
                esperandoPregunta
            ) {

                preguntaActual = {

                    id: uid(),

                    texto: linea,

                    orden:
                        encuesta.preguntas.length + 1,

                    opciones: []

                };


                encuesta.preguntas.push(
                    preguntaActual
                );


                esperandoPregunta =
                    false;


                continue;

            }


            if (
                /^[A-Z]\)/.test(linea)
            ) {

                if (
                    preguntaActual
                ) {

                    preguntaActual.opciones.push({

                        id: uid(),

                        texto:
                            linea.replace(
                                /^[A-Z]\)\s*/,
                                ""
                            )

                    });

                }

            }

        }


        encuesta.preguntas =
            encuesta.preguntas.filter(

                p =>
                    p.opciones.length >= 2

            );


        return encuesta;

    }


    // =============================
    // VALIDAR
    // =============================

    function validar() {

        if (
            !titulo.trim()
        ) {

            return (
                "Debe ingresar el título de la encuesta."
            );

        }


        if (
            !descripcion.trim()
        ) {

            return (
                "Debe ingresar la descripción de la encuesta."
            );

        }


        if (!rol) {

            return (
                "Debe seleccionar el rol a encuestar."
            );

        }



        if (
            preguntas.length === 0
        ) {

            return (
                "Debe agregar al menos una pregunta."
            );

        }


        for (
            const pregunta of preguntas
        ) {

            if (
                !pregunta.texto.trim()
            ) {

                return (
                    "Todas las preguntas deben tener un enunciado."
                );

            }


            if (
                pregunta.opciones.length < 2
            ) {

                return (

                    `La pregunta "${pregunta.texto}" debe tener al menos dos opciones.`

                );

            }


            for (
                const opcion of pregunta.opciones
            ) {

                if (
                    !opcion.texto.trim()
                ) {

                    return (

                        `La pregunta "${pregunta.texto}" tiene opciones vacías.`

                    );

                }

            }

        }


        return "";

    }


    // =============================
    // GUARDAR
    // =============================

    async function handleGuardar() {


        const mensajeError =
            validar();


        if (
            mensajeError
        ) {

            toast.error(
                mensajeError
            );

            return;

        }


        // =============================
        // PAYLOAD PREGUNTAS
        // =============================

        const preguntasPayload =

            preguntas.map(

                (
                    p,
                    index
                ) => ({

                    id:
                        typeof p.id === "number"
                            ? p.id
                            : null,

                    texto:
                        p.texto,

                    orden:
                        index + 1,

                    opciones:

                        p.opciones.map(

                            op => ({

                                id:

                                    typeof op.id === "number"

                                        ?

                                        op.id

                                        :

                                        null,

                                texto:
                                    op.texto

                            })

                        )

                })

            );


        try {


            // =============================
            // CREAR
            // =============================

            if (modo === "crear") {

                const payload = {

                    titulo,

                    descripcion,

                    rol,

                    preguntas:
                        preguntasPayload

                };

                console.log(
                    "Payload crear:",
                    payload
                );

                await crearEncuesta(

                    {
                        encuestaRepository
                    },

                    payload

                );

                toast.success(
                    "Encuesta creada correctamente"
                );

            }

            // =============================
            // EDITAR
            // =============================

            else {

                await actualizarEncuesta(

                    {
                        encuestaRepository
                    },

                    id,

                    {
                        titulo,
                        descripcion,
                        rol,
                        preguntas: preguntasPayload
                    }

                );

                toast.success(
                    "Encuesta actualizada correctamente"
                );

            }


            navigate(-1);


        } catch (err) {

            console.error(
                err
            );


            toast.error(

                err.response?.data?.message

                ||

                "Ocurrió un error al guardar la encuesta"

            );

        }

    }


    // =============================
    // CANCELAR
    // =============================

    function handleCancelar() {

        navigate(-1);

    }


    // =============================
    // RENDER
    // =============================

    return (

        <Layout
            footerLabel="Director"
        >

            < button

                type="button"

                onClick={
                    handleCancelar
                }

                className="
            inline-flex
            items-center
            gap-2
            mb-5
            text-sm
            font-semibold
            text-slate-600
            hover:text-red-500
            transition-colors
        "
            >

                <ArrowLeft
                    size={18}
                />

                Regresar

            </button>



            <h1
                className="
                    text-[26px]
                    font-extrabold
                    text-slate-800
                    text-center
                    mb-7
                    tracking-tight
                "
            >

                {

                    modo === "editar"

                        ?

                        "Editar Encuesta"

                        :

                        "Agregar Encuesta"

                }

            </h1>


            {/* =============================
                TITULO
            ============================== */}

            <div className="mb-6">

                <label
                    className="
                        text-sm
                        font-bold
                        text-slate-700
                        block
                        mb-2
                    "
                >

                    Título de encuesta

                </label>


                <input

                    value={
                        titulo
                    }

                    onChange={
                        e =>
                            setTitulo(
                                e.target.value
                            )
                    }

                    placeholder="Digite el título de la encuesta"

                    className="
                        w-full
                        bg-white
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-200
                    "

                />

            </div>


            {/* =============================
                DESCRIPCIÓN
            ============================== */}

            <div className="mb-6">

                <label
                    className="
                        text-sm
                        font-bold
                        text-slate-700
                        block
                        mb-2
                    "
                >

                    Descripción de encuesta

                </label>


                <input

                    value={
                        descripcion
                    }

                    onChange={
                        e =>
                            setDescripcion(
                                e.target.value
                            )
                    }

                    placeholder="Digite la descripción de la encuesta"

                    className="
                        w-full
                        bg-white
                        rounded-xl
                        px-4
                        py-3
                        text-sm
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-200
                    "

                />

            </div>


            {/* =============================
                ROL
            ============================== */}

            <div className="mb-6">

                <label
                    className="
                        text-sm
                        font-bold
                        text-slate-700
                        block
                        mb-2
                    "
                >

                    Rol a encuestar

                </label>


                <div className="relative inline-block">


                    <button

                        type="button"

                        onClick={() =>
                            setMenuRolAbierto(
                                v => !v
                            )
                        }

                        className="
                            inline-flex
                            items-center
                            gap-1.5
                            px-4
                            py-2
                            rounded-full
                            border-2
                            border-red-300
                            text-red-500
                            text-sm
                            font-semibold
                            bg-white
                            hover:bg-red-50
                            transition-colors
                        "
                    >

                        {
                            rol ||
                            "Seleccionar rol"
                        }


                        <ChevronDown
                            size={14}
                        />

                    </button>


                    {
                        menuRolAbierto && (

                            <div
                                className="
                                    absolute
                                    z-20
                                    mt-1.5
                                    w-48
                                    bg-white
                                    border
                                    border-slate-200
                                    rounded-lg
                                    shadow-lg
                                    overflow-hidden
                                "
                            >

                                {

                                    ROLES.map(

                                        r => (

                                            <button

                                                key={
                                                    r
                                                }

                                                type="button"

                                                onClick={() => {

                                                    setRol(
                                                        r
                                                    );

                                                    setMenuRolAbierto(
                                                        false
                                                    );

                                                }}

                                                className="
                                                    w-full
                                                    text-left
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    text-slate-600
                                                    hover:bg-slate-50
                                                "
                                            >

                                                {
                                                    r
                                                }

                                            </button>

                                        )

                                    )

                                }

                            </div>

                        )

                    }

                </div>

            </div>



            {/* =============================
                ARCHIVO WORD
            ============================== */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    mb-6
                "
            >


                <div />


                <div
                    className="
                        flex
                        items-center
                        gap-3
                    "
                >

                    <label

                        title={
                            archivoNombre
                        }

                        className="
                            inline-flex
                            items-center
                            gap-2
                            px-5
                            py-2.5
                            rounded-xl
                            bg-red-600
                            text-white
                            text-sm
                            font-semibold
                            cursor-pointer
                            hover:bg-red-700
                            transition-colors
                            max-w-xs
                        "
                    >

                        <Paperclip
                            size={16}
                        />


                        <span
                            className="
                                truncate
                                max-w-[180px]
                            "
                        >

                            {

                                archivoNombre

                                ||

                                "Adjuntar documento"

                            }

                        </span>


                        <input

                            ref={
                                fileInputRef
                            }

                            type="file"

                            accept=".docx"

                            hidden

                            onChange={
                                handleArchivoSeleccionado
                            }

                        />

                    </label>


                    <a

                        href="
                            /plantillas/Plantilla_Encuesta.docx
                        "

                        download

                        className="
                            inline-flex
                            items-center
                            gap-2
                            px-5
                            py-2.5
                            rounded-xl
                            border-2
                            border-slate-300
                            text-slate-700
                            text-sm
                            font-semibold
                            bg-white
                            hover:border-slate-400
                            hover:bg-slate-50
                            transition-colors
                        "
                    >

                        <File
                            size={16}
                        />

                        Descargar plantilla

                    </a>

                </div>

            </div>


            {/* =============================
                ERROR
            ============================== */}

            {

                error && (

                    <div
                        className="
                            mb-5
                            px-4
                            py-2.5
                            rounded-lg
                            bg-red-50
                            border
                            border-red-200
                            text-red-600
                            text-sm
                        "
                    >

                        {
                            error
                        }

                    </div>

                )

            }


            {/* =============================
                PREGUNTAS
            ============================== */}

            <div className="space-y-5">


                {

                    preguntas.map(

                        (
                            pregunta,
                            index
                        ) => (

                            <BloquePregunta

                                key={
                                    pregunta.id
                                }

                                numero={
                                    index + 1
                                }

                                pregunta={
                                    pregunta
                                }

                                puedeEliminar={
                                    preguntas.length > 1
                                }

                                onCambiarTexto={

                                    texto =>

                                        actualizarTextoPregunta(

                                            pregunta.id,

                                            texto

                                        )

                                }

                                onAgregarOpcion={

                                    texto =>

                                        agregarOpcion(

                                            pregunta.id,

                                            texto

                                        )

                                }

                                onEliminarOpcion={

                                    opcionId =>

                                        eliminarOpcion(

                                            pregunta.id,

                                            opcionId

                                        )

                                }

                                onEliminarBloque={() =>

                                    eliminarBloquePregunta(

                                        pregunta.id

                                    )

                                }

                            />

                        )

                    )

                }


                <button

                    type="button"

                    onClick={
                        agregarBloquePregunta
                    }

                    className="
                        w-full
                        bg-white
                        rounded-2xl
                        border-2
                        border-red-200
                        hover:border-red-300
                        hover:bg-red-50/40
                        transition-colors
                        py-10
                        flex
                        items-center
                        justify-center
                        group
                    "
                >

                    <span
                        className="
                            w-14
                            h-14
                            rounded-full
                            border-2
                            border-red-300
                            text-red-400
                            flex
                            items-center
                            justify-center
                            group-hover:bg-red-100
                            transition-colors
                        "
                    >

                        <Plus
                            size={26}
                        />

                    </span>

                </button>

            </div>


            {/* =============================
                BOTONES
            ============================== */}

            <div
                className="
                    flex
                    justify-end
                    gap-3
                    mt-8
                "
            >

                <button

                    type="button"

                    onClick={
                        handleCancelar
                    }

                    className="
                        px-6
                        py-2.5
                        rounded-full
                        border-2
                        border-slate-300
                        text-slate-600
                        text-sm
                        font-semibold
                        hover:bg-slate-50
                        transition-colors
                    "
                >

                    Cancelar

                </button>


                <button

                    type="button"

                    onClick={
                        handleGuardar
                    }

                    className="
                        px-6
                        py-2.5
                        rounded-full
                        bg-red-500
                        text-white
                        text-sm
                        font-semibold
                        hover:bg-red-600
                        active:scale-95
                        transition-all
                        shadow-sm
                    "
                >

                    Guardar

                </button>

            </div>


        </Layout >

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

    onAgregarOpcion,

    onEliminarOpcion,

    onEliminarBloque

}) {


    const [opcionInput, setOpcionInput] =
        useState("");


    function confirmarOpcion() {

        onAgregarOpcion(
            opcionInput
        );

        setOpcionInput("");

    }


    function handleKeyDown(e) {

        if (
            e.key === "Enter"
        ) {

            e.preventDefault();

            confirmarOpcion();

        }

    }


    return (

        <div
            className="
                relative
                bg-white
                rounded-2xl
                border-2
                border-red-200
                p-6
            "
        >


            {

                puedeEliminar && (

                    <button

                        type="button"

                        onClick={
                            onEliminarBloque
                        }

                        className="
                            absolute
                            top-3
                            right-3
                            text-slate-300
                            hover:text-red-500
                            transition-colors
                        "

                        title="
                            Eliminar pregunta
                        "
                    >

                        <X
                            size={16}
                        />

                    </button>

                )

            }


            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-6
                "
            >


                {/* PREGUNTA */}

                <div>

                    <label
                        className="
                            text-sm
                            font-bold
                            text-slate-800
                            block
                            mb-2
                        "
                    >

                        Pregunta {numero}:

                    </label>


                    <textarea

                        value={
                            pregunta.texto
                        }

                        onChange={e =>
                            onCambiarTexto(
                                e.target.value
                            )
                        }

                        placeholder="Digite la pregunta"

                        rows={3}

                        className="
                            w-full
                            bg-slate-100
                            border-0
                            rounded-xl
                            px-4
                            py-3
                            text-sm
                            text-slate-700
                            placeholder:text-slate-400
                            resize-none
                            focus:outline-none
                            focus:ring-2
                            focus:ring-red-200
                        "

                    />

                </div>


                {/* OPCIONES */}

                <div>

                    <label
                        className="
                            text-sm
                            font-bold
                            text-slate-800
                            block
                            mb-2
                        "
                    >

                        Opción respuesta:

                    </label>


                    <input

                        type="text"

                        value={
                            opcionInput
                        }

                        onChange={e =>
                            setOpcionInput(
                                e.target.value
                            )
                        }

                        onKeyDown={
                            handleKeyDown
                        }

                        placeholder="Digite la respuesta"

                        className="
                            w-full
                            bg-slate-100
                            border-0
                            rounded-xl
                            px-4
                            py-2.5
                            text-sm
                            text-slate-700
                            placeholder:text-slate-400
                            mb-2
                            focus:outline-none
                            focus:ring-2
                            focus:ring-red-200
                        "

                    />


                    <button

                        type="button"

                        onClick={
                            confirmarOpcion
                        }

                        className="
                            w-full
                            bg-slate-100
                            hover:bg-slate-200
                            rounded-xl
                            py-2.5
                            flex
                            items-center
                            justify-center
                            text-slate-500
                            transition-colors
                        "
                    >

                        <Plus
                            size={18}
                        />

                    </button>


                    {

                        pregunta.opciones.length > 0 && (

                            <div
                                className="
                                    flex
                                    flex-wrap
                                    gap-1.5
                                    mt-3
                                "
                            >

                                {

                                    pregunta.opciones.map(

                                        op => (

                                            <span

                                                key={
                                                    op.id
                                                }

                                                className="
                                                    flex
                                                    items-center
                                                    gap-1
                                                    bg-red-50
                                                    text-red-600
                                                    text-xs
                                                    font-medium
                                                    px-2.5
                                                    py-1
                                                    rounded-full
                                                "
                                            >

                                                {
                                                    op.texto
                                                }


                                                <button

                                                    type="button"

                                                    onClick={() =>

                                                        onEliminarOpcion(

                                                            op.id

                                                        )

                                                    }

                                                    className="
                                                        text-red-300
                                                        hover:text-red-600
                                                    "
                                                >

                                                    <X
                                                        size={11}
                                                    />

                                                </button>

                                            </span>

                                        )

                                    )

                                }

                            </div>

                        )

                    }

                </div>

            </div>

        </div>

    );

}