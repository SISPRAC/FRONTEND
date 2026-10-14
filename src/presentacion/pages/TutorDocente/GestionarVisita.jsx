import {
    useEffect,
    useRef,
    useState
} from "react";

import toast from "react-hot-toast";

import { actualizarVisita } from "../../../aplicacion/visita/actualizarVisita.js";
import { obtenerVisita } from "../../../aplicacion/visita/obtenerVisita.js";

import { visitaRepository } from "../../../infraestructura/repository/visitaRepository.js";

import {
    ArrowLeft,
    Download,
    Upload,
    Plus,
    Eye,
    X
} from "lucide-react";

import {
    useLocation,
    useNavigate
} from "react-router-dom";

const MAX_EVIDENCIAS = 3;


const formatearFecha = (fecha) => {
    if (!fecha) {
        return "Sin fecha";
    }

    const fechaTexto = String(fecha).split("T")[0];

    const [year, month, day] = fechaTexto.split("-");

    if (!year || !month || !day) {
        return "Sin fecha";
    }

    return `${day}/${month}/${year}`;
};


const formatearHora = (hora) => {

    if (!hora) {
        return "Sin hora";
    }

    const [horas, minutos] =
        hora.split(":");

    let horaNumero = Number(horas);

    const periodo =
        horaNumero >= 12
            ? "p. m."
            : "a. m.";

    if (horaNumero === 0) {

        horaNumero = 12;

    } else if (horaNumero > 12) {

        horaNumero -= 12;

    }

    return `${horaNumero}:${minutos} ${periodo}`;
};

/* ================================================= */
/* MODAL PARA VISUALIZAR EL INFORME */
/* ================================================= */

const VisorInforme = ({
    informe,
    onClose
}) => {

    useEffect(() => {

        const onKey = (e) => {

            if (e.key === "Escape") {
                onClose();
            }

        };

        window.addEventListener(
            "keydown",
            onKey
        );

        return () => {

            window.removeEventListener(
                "keydown",
                onKey
            );

        };

    }, [onClose]);

    const nombre =
        informe?.nombre || "Informe";

    const tipo =
        informe?.file?.type || "";

    const esPdf =
        tipo === "application/pdf" ||
        /\.pdf$/i.test(nombre);

    const esImagen =
        tipo.startsWith("image/") ||
        /\.(png|jpe?g|gif|webp)$/i.test(
            nombre
        );

    return (

        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-3 sm:p-6"
            onClick={onClose}
        >

            <div
                role="dialog"
                aria-modal="true"
                aria-label={nombre}
                onClick={(e) =>
                    e.stopPropagation()
                }
                className="flex h-[85dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
            >

                <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5">

                    <h3 className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {nombre}
                    </h3>

                    {informe?.url && (

                        <a
                            href={informe.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-100"
                        >
                            Abrir aparte
                        </a>

                    )}

                    <button
                        type="button"
                        aria-label="Cerrar"
                        onClick={onClose}
                        className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                        <X size={18} />
                    </button>

                </div>

                <div className="min-h-0 flex-1 bg-slate-100">

                    {esPdf ? (

                        <iframe
                            src={informe.url}
                            title={nombre}
                            className="h-full w-full"
                        />

                    ) : esImagen ? (

                        <img
                            src={informe.url}
                            alt={nombre}
                            className="h-full w-full object-contain"
                        />

                    ) : (

                        <div className="grid h-full place-items-center p-6 text-center text-sm text-slate-500">

                            Este tipo de archivo no se puede
                            previsualizar. Usa “Abrir aparte”
                            para verlo.

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
};

/* ================================================= */
/* COMPONENTE PRINCIPAL */
/* ================================================= */

const VisitaEmpresarial = ({
    visita: visitaProp,
    onBack,
    onCancel
}) => {

    const location = useLocation();
    const navigate = useNavigate();

    const visita =
        visitaProp ||
        location.state?.solicitud ||
        null;

    /*
     * ID estable de la visita.
     *
     * Importante:
     * la consulta de archivos depende únicamente
     * de este valor y no del objeto visita completo.
     */
    const visitaId =
        visita?.visita?.id || null;

    const [descripcion, setDescripcion] =
        useState(
            visita?.visita?.descripcion || ""
        );

    const [informe, setInforme] =
        useState(null);

    const [evidencias, setEvidencias] =
        useState([]);

    const [verInforme, setVerInforme] =
        useState(false);

    const [guardando, setGuardando] =
        useState(false);

    const [cargandoArchivos, setCargandoArchivos] =
        useState(true);

    /*
     * Guarda el ID de la visita que ya fue consultada.
     *
     * Evita que escribir en el textarea,
     * agregar fotos o seleccionar archivos
     * vuelva a ejecutar la consulta.
     */
    const visitaConsultadaRef =
        useRef(null);

    const informeInput =
        useRef(null);

    const fotoInput =
        useRef(null);

    /*
     * Input oculto utilizado exclusivamente
     * para reemplazar una fotografía existente.
     */
    const reemplazoFotoInput =
        useRef(null);

    const [fotoReemplazarIndex, setFotoReemplazarIndex] =
        useState(null);

    /* ================================================= */
    /* CARGAR ARCHIVOS EXISTENTES */
    /* ================================================= */

    useEffect(() => {

        if (!visitaId) {

            setCargandoArchivos(false);

            return;
        }

        /*
         * Si ya consultamos esta visita,
         * no volvemos a realizar la petición.
         */
        if (
            visitaConsultadaRef.current ===
            visitaId
        ) {
            return;
        }

        visitaConsultadaRef.current =
            visitaId;

        const cargarArchivos =
            async () => {

                setCargandoArchivos(
                    true
                );

                try {

                    const response =
                        await obtenerVisita({
                            visitaRepository,
                            visitaId
                        });

                    /*
                     * Soportamos tanto:
                     *
                     * response.data
                     *
                     * como directamente response.
                     */
                    const visitaCompleta =
                        response?.data ||
                        response;

                    /*
                     * Dependiendo de cómo venga
                     * la respuesta del backend.
                     */
                    const archivos =
                        visitaCompleta?.evidencias ||
                        visitaCompleta?.VisitaArchivos ||
                        [];

                    const fotografias =
                        archivos
                            .filter(
                                (archivo) =>
                                    archivo.tipo ===
                                    "Fotografia"
                            )
                            .slice(
                                0,
                                MAX_EVIDENCIAS
                            )
                            .map(
                                (archivo) => ({

                                    id:
                                        archivo.id,

                                    archivoId:
                                        archivo.archivo?.id ||
                                        archivo.Archivo?.id,

                                    url:
                                        archivo.archivo?.url ||
                                        archivo.Archivo?.url,

                                    nombre:
                                        archivo.archivo?.nombre ||
                                        archivo.Archivo?.nombre

                                })
                            )
                            .filter(
                                (archivo) =>
                                    archivo.url
                            );

                    const acta =
                        archivos.find(
                            (archivo) =>
                                archivo.tipo ===
                                "Acta"
                        );

                    setEvidencias(
                        fotografias
                    );

                    if (acta) {

                        setInforme({

                            id:
                                acta.id,

                            archivoId:
                                acta.archivo?.id ||
                                acta.Archivo?.id,

                            nombre:
                                acta.archivo?.nombre ||
                                acta.Archivo?.nombre,

                            url:
                                acta.archivo?.url ||
                                acta.Archivo?.url

                        });

                    } else {

                        setInforme(null);

                    }

                } catch (error) {

                    console.error(
                        "Error al cargar los archivos de la visita:",
                        error
                    );

                    toast.error(
                        "No se pudieron cargar los archivos de la visita"
                    );

                } finally {

                    setCargandoArchivos(
                        false
                    );

                }

            };

        cargarArchivos();

    }, [visitaId]);

    /* ================================================= */
    /* SI NO EXISTE LA VISITA */
    /* ================================================= */

    if (!visita) {

        return (

            <div>

                <section className="flex min-h-[calc(100dvh-5rem)] items-center justify-center">

                    <div className="text-center">

                        <p className="mb-4 text-sm text-slate-500">

                            No se encontró la información
                            de la visita.

                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                        >
                            Regresar
                        </button>

                    </div>

                </section>

            </div>

        );
    }

    /* ================================================= */
    /* ACTA */
    /* ================================================= */

    const adjuntarInforme = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) {

            e.target.value = "";

            return;
        }

        if (
            file.type !==
            "application/pdf"
        ) {

            toast.error(
                "El acta debe ser un archivo PDF"
            );

            e.target.value = "";

            return;
        }

        /*
         * Si ya existía un acta,
         * conservamos su ID para que
         * el backend sepa que debe reemplazarla.
         */
        setInforme((actual) => ({

            id:
                actual?.id || null,

            archivoId:
                actual?.archivoId || null,

            nombre:
                file.name,

            url:
                URL.createObjectURL(
                    file
                ),

            file

        }));

        toast.success(
            "Acta seleccionada correctamente"
        );

        e.target.value = "";
    };

    /* ================================================= */
    /* AGREGAR FOTOS */
    /* ================================================= */

    const agregarFotos = (e) => {

        const archivos =
            Array.from(
                e.target.files || []
            );

        const disponibles =
            MAX_EVIDENCIAS -
            evidencias.length;

        if (
            disponibles <= 0
        ) {

            toast.error(
                "La visita no puede tener más de 3 fotografías"
            );

            e.target.value = "";

            return;
        }

        const archivosSeleccionados =
            archivos.slice(
                0,
                disponibles
            );

        if (
            archivos.length >
            disponibles
        ) {

            toast.error(
                "Solo puedes tener hasta 3 fotografías"
            );
        }

        const nuevas =
            archivosSeleccionados.map(
                (file) => ({

                    file,

                    url:
                        URL.createObjectURL(
                            file
                        )

                })
            );

        setEvidencias(
            (prev) => [
                ...prev,
                ...nuevas
            ]
        );

        e.target.value = "";
    };

    /* ================================================= */
    /* QUITAR FOTO */
    /* ================================================= */

    const quitarFoto = (index) => {

        setEvidencias(
            (prev) =>
                prev.filter(
                    (_, i) =>
                        i !== index
                )
        );
    };

    /* ================================================= */
    /* CAMBIAR FOTO EXISTENTE */
    /* ================================================= */

    const cambiarFoto = (index) => {

        setFotoReemplazarIndex(
            index
        );

        reemplazoFotoInput.current?.click();
    };

    const procesarCambioFoto = (e) => {

        const file =
            e.target.files?.[0];

        if (
            !file ||
            fotoReemplazarIndex === null
        ) {

            e.target.value = "";

            return;
        }

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            toast.error(
                "Solo se permiten imágenes"
            );

            e.target.value = "";

            return;
        }

        setEvidencias(
            (prev) => {

                const copia = [
                    ...prev
                ];

                const fotografiaActual =
                    copia[
                    fotoReemplazarIndex
                    ];

                copia[
                    fotoReemplazarIndex
                ] = {

                    ...fotografiaActual,

                    file,

                    url:
                        URL.createObjectURL(
                            file
                        ),

                    /*
                     * Si era una fotografía
                     * existente, guardamos su
                     * VisitaArchivo.id.
                     */
                    reemplazar_visita_archivo_id:
                        fotografiaActual.id ||
                        null

                };

                return copia;
            }
        );

        setFotoReemplazarIndex(
            null
        );

        toast.success(
            "Fotografía seleccionada para reemplazo"
        );

        e.target.value = "";
    };

    /* ================================================= */
    /* GUARDAR */
    /* ================================================= */

    const guardar = async () => {

        if (!visitaId) {

            toast.error(
                "No se encontró el ID de la visita"
            );

            return;
        }

        setGuardando(true);

        try {

            const formData =
                new FormData();

            formData.append(
                "descripcion",
                descripcion
            );

            /*
             * Aquí solamente enviamos:
             *
             * - fotos nuevas
             * - fotos que reemplazan otra
             *
             * Las fotos existentes que no fueron
             * modificadas NO se vuelven a enviar.
             */
            const fotosReemplazo = [];

            evidencias.forEach(
                (evidencia) => {

                    if (!evidencia.file) {
                        return;
                    }

                    formData.append(
                        "fotos",
                        evidencia.file
                    );

                    fotosReemplazo.push(
                        evidencia
                            .reemplazar_visita_archivo_id
                        || null
                    );

                }
            );

            /*
             * El backend recibe un único JSON
             * con el mismo orden de las fotografías.
             */
            if (
                fotosReemplazo.length >
                0
            ) {

                formData.append(
                    "fotos_reemplazo",
                    JSON.stringify(
                        fotosReemplazo
                    )
                );
            }

            /*
             * Si informe.file existe:
             *
             * - si no había acta: crea una
             * - si ya había acta: la reemplaza
             */
            if (
                informe?.file
            ) {

                formData.append(
                    "acta",
                    informe.file
                );
            }

            await actualizarVisita({
                visitaRepository,
                visitaId,
                data: formData
            });

            toast.success(
                "Visita actualizada correctamente"
            );

            handleBack();

        } catch (error) {

            console.error(
                "Error al actualizar la visita:",
                error
            );

            const mensaje =
                error?.response?.data?.message ||
                "No se pudo actualizar la visita";

            toast.error(
                mensaje
            );

        } finally {

            setGuardando(
                false
            );
        }
    };

    /* ================================================= */
    /* REGRESAR */
    /* ================================================= */

    const handleBack = () => {

        if (onBack) {

            onBack();

            return;
        }

        navigate(-1);
    };

    /* ================================================= */
    /* DATOS */
    /* ================================================= */

    const empresaNombre =
        visita?.empresa?.nombre ||
        "Sin empresa";

    const tutorEmpresarial =
        visita?.tutorEmpresarial ||
        null;

    const tutorEmpresarialNombre =
        tutorEmpresarial?.Usuario
            ? `${tutorEmpresarial.Usuario.nombres || ""} ${tutorEmpresarial.Usuario.apellidos || ""}`.trim()
            : "Sin tutor empresarial";

    const practicantes =
        visita?.practicantes ||
        [];

    const fechaVisita =
        visita?.visita?.fecha_visita;

    const horaVisita =
        visita?.visita?.hora_visita;

    const fechaRealizada =
        visita?.visita?.fecha_realizada;

    const etiqueta =
        "mb-1.5 text-xs font-medium text-slate-500";

    const campo =
        "mb-2 flex items-baseline gap-2 text-sm font-semibold text-slate-700";

    const card =
        "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

    /* ================================================= */
    /* RENDER */
    /* ================================================= */

    return (

        <div>

            <section className="flex flex-col gap-4 text-slate-800 md:grid md:min-h-[calc(100dvh-5rem)] md:grid-rows-[auto_1fr_auto]">

                {/* ================================================= */}
                {/* ENCABEZADO */}
                {/* ================================================= */}

                <header className="flex items-center gap-3">

                    <button
                        type="button"
                        aria-label="Regresar"
                        title="Regresar"
                        onClick={handleBack}
                        className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white text-slate-600 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                        <ArrowLeft
                            size={20}
                        />
                    </button>

                    <h1 className="min-w-0 flex-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
                        Visita empresarial
                    </h1>

                    {visita?.formatoUrl && (

                        <a
                            href={
                                visita.formatoUrl
                            }
                            download
                            aria-label="Descargar formato de visita"
                            title="Descargar formato de visita"
                            className="flex h-9 flex-none items-center gap-1.5 rounded-full bg-white px-3 text-sm font-semibold text-red-600 ring-1 ring-inset ring-red-200 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:px-4"
                        >

                            <Download
                                size={16}
                            />

                            <span className="hidden sm:inline">
                                Descargar formato de visita
                            </span>

                        </a>

                    )}

                </header>

                {/* ================================================= */}
                {/* CONTENIDO */}
                {/* ================================================= */}

                <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]">

                    {/* ================================================= */}
                    {/* RESUMEN */}
                    {/* ================================================= */}

                    <aside
                        className={`${card} divide-y divide-slate-100 md:flex md:flex-col`}
                    >

                        {/* Empresa */}

                        <div className="flex items-center gap-3 pb-4">

                            <span className="grid h-10 w-10 flex-none place-items-center overflow-hidden rounded-xl bg-red-50 text-base font-bold text-red-600">

                                {visita?.empresa?.logo ? (

                                    <img
                                        src={
                                            visita.empresa.logo
                                        }
                                        alt={
                                            empresaNombre
                                        }
                                        className="h-full w-full object-cover"
                                    />

                                ) : (

                                    empresaNombre
                                        .charAt(0)
                                        .toUpperCase()

                                )}

                            </span>

                            <div className="min-w-0">

                                <p className="text-xs text-slate-500">
                                    Empresa
                                </p>

                                <p className="truncate font-semibold">
                                    {empresaNombre}
                                </p>

                            </div>

                        </div>

                        {/* Tutor empresarial */}

                        <div className="py-4">

                            <p className="text-xs text-slate-500">
                                Tutor empresarial
                            </p>

                            <p className="text-sm font-semibold text-slate-700">
                                {tutorEmpresarialNombre}
                            </p>

                            {tutorEmpresarial?.cargo && (

                                <p className="mt-0.5 text-xs text-slate-500">
                                    {tutorEmpresarial.cargo}
                                </p>

                            )}

                        </div>

                        {/* Fechas */}

                        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 py-4 md:grid-cols-1">

                            <div>

                                <dt className="text-xs text-slate-500">
                                    Fecha y hora asignada
                                </dt>

                                <dd className="text-sm font-semibold">

                                    {formatearFecha(
                                        fechaVisita
                                    )}

                                    {" · "}

                                    {formatearHora(
                                        horaVisita
                                    )}

                                </dd>

                            </div>

                            {fechaRealizada && (

                                <div>

                                    <dt className="text-xs text-slate-500">
                                        ultima modificación
                                    </dt>

                                    <dd className="text-sm font-semibold">

                                        {formatearFecha(
                                            fechaRealizada
                                        )}

                                    </dd>

                                </div>

                            )}

                        </dl>

                        {/* Practicantes */}

                        <div className="flex flex-col py-4 md:flex-1">

                            <h2 className={etiqueta}>

                                {practicantes.length > 1
                                    ? "Practicantes"
                                    : "Practicante"}

                            </h2>

                            <div className="md:relative md:min-h-[5rem] md:flex-1">

                                <ul className="flex max-h-40 flex-col gap-1.5 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:absolute md:inset-0 md:max-h-none">

                                    {practicantes.length > 0 ? (

                                        practicantes.map(
                                            (p, index) => (

                                                <li
                                                    key={
                                                        p.practicaPracticanteId ||
                                                        p.id ||
                                                        index
                                                    }
                                                    className="rounded-lg bg-slate-50 px-3 py-1.5 text-sm"
                                                >

                                                    {p.codigo ? (

                                                        <>

                                                            <b className="font-semibold">
                                                                {p.codigo}
                                                            </b>

                                                            {" - "}

                                                        </>

                                                    ) : null}

                                                    {p.nombres ||
                                                        p.nombre ||
                                                        "Practicante sin nombre"}

                                                    {p.apellidos
                                                        ? ` ${p.apellidos}`
                                                        : ""}

                                                </li>

                                            )
                                        )

                                    ) : (

                                        <li className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">

                                            No hay practicantes
                                            asociados.

                                        </li>

                                    )}

                                </ul>

                            </div>

                        </div>

                        {/* ================================================= */}
                        {/* INFORME / ACTA */}
                        {/* ================================================= */}

                        <div className="pt-4">

                            <h2 className={etiqueta}>
                                Informe de visita
                            </h2>

                            {cargandoArchivos ? (

                                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">

                                    Cargando archivo...

                                </div>

                            ) : informe ? (

                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">

                                    <div className="flex items-center gap-3">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVerInforme(
                                                    true
                                                )
                                            }
                                            className="grid h-8 w-8 flex-none place-items-center rounded-full bg-emerald-500 text-sm font-bold text-white"
                                            title="Ver informe"
                                        >
                                            <Eye
                                                size={16}
                                            />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVerInforme(
                                                    true
                                                )
                                            }
                                            className="min-w-0 flex-1 text-left"
                                        >

                                            <strong className="block text-sm">
                                                {informe.file
                                                    ? "Nuevo archivo seleccionado"
                                                    : "Informe cargado"}
                                            </strong>

                                            <small className="block truncate text-xs text-slate-500">
                                                {informe.nombre}
                                            </small>

                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                informeInput.current?.click()
                                            }
                                            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-inset ring-red-200 transition hover:bg-red-50"
                                        >
                                            Cambiar
                                        </button>

                                    </div>

                                </div>

                            ) : (

                                <button
                                    type="button"
                                    onClick={() =>
                                        informeInput.current?.click()
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
                                >

                                    <Upload
                                        size={17}
                                    />

                                    Adjunte formato diligenciado

                                </button>

                            )}

                            <input
                                ref={
                                    informeInput
                                }
                                type="file"
                                hidden
                                accept="application/pdf"
                                onChange={
                                    adjuntarInforme
                                }
                            />

                        </div>

                    </aside>

                    {/* ================================================= */}
                    {/* REGISTRO DE LA VISITA */}
                    {/* ================================================= */}

                    <div
                        className={`${card} flex flex-col gap-6`}
                    >

                        {/* Descripción */}

                        <div className="flex flex-col md:flex-1">

                            <label
                                htmlFor="descripcion"
                                className={campo}
                            >
                                Descripción de la visita
                            </label>

                            <textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) =>
                                    setDescripcion(
                                        e.target.value
                                    )
                                }
                                placeholder="Escribe aquí lo que se observó durante la visita…"
                                className="h-36 w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100 md:h-auto md:min-h-[11rem] md:flex-1"
                            />

                        </div>

                        {/* ================================================= */}
                        {/* EVIDENCIAS */}
                        {/* ================================================= */}

                        <div>

                            <h2 className={campo}>

                                Evidencia

                                <small className="font-medium text-slate-400">

                                    {evidencias.length} de{" "}
                                    {MAX_EVIDENCIAS}

                                </small>

                            </h2>

                            <div className="grid max-w-md grid-cols-3 gap-3">

                                {evidencias.map(
                                    (ev, i) => (

                                        <figure
                                            key={
                                                ev.id ||
                                                ev.url ||
                                                i
                                            }
                                            className="group relative m-0 aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                                        >

                                            <img
                                                src={ev.url}
                                                alt={`Evidencia ${i + 1}`}
                                                className="h-full w-full object-cover"
                                            />

                                            {/* Acciones */}

                                            <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1.5">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        cambiarFoto(
                                                            i
                                                        )
                                                    }
                                                    className="flex-1 rounded-lg bg-slate-900/75 px-2 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900"
                                                >
                                                    Cambiar
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-label="Quitar foto"
                                                    onClick={() =>
                                                        quitarFoto(
                                                            i
                                                        )
                                                    }
                                                    className="grid h-7 w-7 place-items-center rounded-lg bg-slate-900/75 text-white transition hover:bg-slate-900"
                                                >

                                                    <X
                                                        size={14}
                                                    />

                                                </button>

                                            </div>

                                        </figure>

                                    )
                                )}

                                {evidencias.length <
                                    MAX_EVIDENCIAS && (

                                        <button
                                            type="button"
                                            onClick={() =>
                                                fotoInput.current?.click()
                                            }
                                            className="flex aspect-[4/3] flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-dashed border-slate-300 text-xs font-semibold text-slate-500 transition-colors hover:border-red-400 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200"
                                        >

                                            <Plus
                                                size={20}
                                            />

                                            Agregar foto

                                        </button>

                                    )}

                            </div>

                            {/* Input para agregar fotos */}

                            <input
                                ref={
                                    fotoInput
                                }
                                type="file"
                                accept="image/*"
                                multiple
                                hidden
                                onChange={
                                    agregarFotos
                                }
                            />

                            {/* Input para reemplazar una foto */}

                            <input
                                ref={
                                    reemplazoFotoInput
                                }
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={
                                    procesarCambioFoto
                                }
                            />

                        </div>

                    </div>

                </div>

                {/* ================================================= */}
                {/* ACCIONES */}
                {/* ================================================= */}

                <footer className="grid grid-cols-2 gap-2.5 sm:flex sm:justify-end">

                    <button
                        type="button"
                        onClick={
                            onCancel ||
                            handleBack
                        }
                        className="rounded-full bg-slate-200 px-7 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-300"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={guardar}
                        disabled={
                            guardando ||
                            cargandoArchivos
                        }
                        className="rounded-full bg-red-500 px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-200 disabled:opacity-60"
                    >

                        {guardando
                            ? "Guardando…"
                            : "Guardar"}

                    </button>

                </footer>

            </section>

            {/* ================================================= */}
            {/* VISOR DEL INFORME */}
            {/* ================================================= */}

            {verInforme &&
                informe && (

                    <VisorInforme
                        informe={informe}
                        onClose={() =>
                            setVerInforme(
                                false
                            )
                        }
                    />

                )}

        </div>
    );
};

export default VisitaEmpresarial;