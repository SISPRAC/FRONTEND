
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

import bg from "../../assets/images/backgrounds/fondo.jpg";

import {
    Trash2, Plus, X, Check, Sparkles, Languages, Code2, User, UserRound,
    Hash, Phone, Mail, Lock, Eye, EyeOff, FileText, CreditCard, KeyRound,
    Briefcase, AlertCircle, Download, ChevronLeft, ChevronRight, Info,
    BookOpen, Mic, Headphones, LoaderCircle, UploadCloud, FileCheck
} from "lucide-react";

/* ============================================================
   Props importantes:
   - formatoCvUrl: ruta pública de la plantilla de hoja de vida.
   - addHabilidadBlanda({ habilidad_blanda_id, nombre })
   - addPerfil() sin límite en el padre.
   - Inglés obligatorio: el padre inicializa `idiomas` con una fila
     de inglés.
   ============================================================ */

const PLANTILLA_CV =
    "/plantillas/" + encodeURIComponent("Formato Hoja vida Estudiante (NOMBREESTUDIANTE - CODIGO).docx");

const MAX_CV_SIZE = 2 * 1024 * 1024;

const esIngles = (nombre = "") =>
    nombre.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .startsWith("ingl");

const idiomaCompleto = (i) =>
    Boolean(i.idioma_id && i.lee && i.habla && i.escucha);

/* ---------- Piezas ---------- */

function FieldError({ message }) {
    if (!message) return null;

    return (
        <span className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle size={12} /> {message}
        </span>
    );
}

function Field({ label, error, hint, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label}
            </label>

            {children}

            {hint && (
                <span className="text-xs text-gray-400">{hint}</span>
            )}

            <FieldError message={error} />
        </div>
    );
}

function InputWithIcon({ icon: Icon, error, readOnly, right, ...props }) {
    return (
        <div className="relative group">
            <Icon
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors pointer-events-none"
            />

            <input
                {...props}
                readOnly={readOnly}
                className={`
                    w-full rounded-lg pl-10 ${right ? "pr-10" : "pr-4"} py-2.5 text-sm
                    text-gray-700 border outline-none transition shadow-sm
                    focus:border-red-400 focus:ring-2 focus:ring-red-100
                    ${error ? "border-red-400 bg-red-50/60" : "border-gray-200 bg-white"}
                    ${readOnly ? "cursor-not-allowed bg-gray-100 text-gray-500 shadow-none" : ""}
                `}
            />

            {right}
        </div>
    );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <Icon size={22} className="text-red-600" />

            <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    {title}
                </h2>

                <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
        </div>
    );
}

const scrollClass = `
    [scrollbar-width:thin] [scrollbar-color:#e5e7eb_transparent]
    [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200
    hover:[&::-webkit-scrollbar-thumb]:bg-gray-300
`;

function Card({ icon: Icon, title, required, note, children }) {
    return (
        <section className={`flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 lg:max-h-[52vh] lg:overflow-y-auto ${scrollClass}`}>
            <div className="flex items-center gap-2.5">
                <Icon size={16} className="text-gray-500" />

                <h3 className="text-sm font-bold text-gray-800">
                    {title}
                    {required && <span className="text-red-500"> *</span>}
                </h3>

                {note && (
                    <span className="ml-auto text-[11px] text-gray-400">
                        {note}
                    </span>
                )}
            </div>

            {children}
        </section>
    );
}

const selectBase = `
    w-full rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white shadow-sm
    border border-gray-200 outline-none transition
    focus:border-red-400 focus:ring-2 focus:ring-red-100
`;

const ghostAdd = `
    inline-flex items-center gap-1.5 self-start text-sm font-semibold
    text-gray-700 hover:text-red-600 transition-colors
`;

const PASOS = [
    {
        titulo: "Personal",
        desc: "Tus datos básicos",
        icon: User,
        campos: [
            "codigo",
            "primer_nombre",
            "segundo_nombre",
            "primer_apellido",
            "segundo_apellido",
            "telefono",
            "tipo_documento",
            "cedula"
        ]
    },
    {
        titulo: "Cuenta",
        desc: "Acceso y hoja de vida",
        icon: KeyRound,
        campos: ["correo", "password", "cv"]
    },
    {
        titulo: "Perfil",
        desc: "Técnico, blandas e idiomas",
        icon: Briefcase,
        campos: ["perfiles", "habilidades", "idiomas"]
    }
];

const nivelesIcono = {
    lee: BookOpen,
    habla: Mic,
    escucha: Headphones
};

export default function CandidateForm({
    onSubmit,
    onChange,
    handleFileSelect,
    errors,
    backendError,
    form,
    formatoCvUrl = PLANTILLA_CV,

    perfiles,
    addPerfil,
    removePerfil,
    handlePerfilChange,
    listaPerfiles,
    nivelesPerfil,

    habilidadesBlandas,
    listaHabilidadesBlandas,
    addHabilidadBlanda,
    removeHabilidadBlanda,

    idiomas,
    listaIdiomas,
    addIdioma,
    removeIdioma,
    handleIdiomaChange,
    nivelesIdioma
}) {
    const [paso, setPaso] = useState(0);
    const [verPassword, setVerPassword] = useState(false);
    const [nuevaHabilidad, setNuevaHabilidad] = useState("");

    const [modalCvAbierto, setModalCvAbierto] = useState(false);
    const [cvPendiente, setCvPendiente] = useState(null);
    const [cvError, setCvError] = useState("");
    const [cvPreviewUrl, setCvPreviewUrl] = useState("");

    const [registrando, setRegistrando] = useState(false);

    const inputCvRef = useRef(null);

    useEffect(() => {
        if (!cvPendiente) {
            setCvPreviewUrl("");
            return;
        }

        const url = URL.createObjectURL(cvPendiente);

        setCvPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [cvPendiente]);

    const errorEnPaso = (i) =>
        PASOS[i].campos.some((c) => errors?.[c]);

    useEffect(() => {
        const primero = PASOS.findIndex((_, i) => errorEnPaso(i));

        if (primero >= 0) setPaso(primero);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors]);

    /* ---------- Habilidades blandas ---------- */

    const seleccionadas = (habilidadesBlandas || [])
        .map((h, index) => ({ ...h, index }))
        .filter((h) =>
            h.habilidad_blanda_id || (h.nombre && h.nombre.trim())
        );

    const nombreDeHabilidad = (h) =>
        h.nombre?.trim() ||
        listaHabilidadesBlandas.find(
            (x) => String(x.id) === String(h.habilidad_blanda_id)
        )?.nombre ||
        "";

    const disponibles = listaHabilidadesBlandas.filter(
        (item) =>
            !habilidadesBlandas.some(
                (h) => String(h.habilidad_blanda_id) === String(item.id)
            )
    );

    const agregarNueva = () => {
        const nombre = nuevaHabilidad.trim();

        if (!nombre) return;

        const yaExiste = seleccionadas.some(
            (h) =>
                nombreDeHabilidad(h).toLowerCase() === nombre.toLowerCase()
        );

        if (!yaExiste) {
            addHabilidadBlanda({
                habilidad_blanda_id: "",
                nombre
            });
        }

        setNuevaHabilidad("");
    };

    const descripcionPerfil = (perfil) =>
        listaPerfiles.find(
            (x) => String(x.id) === String(perfil.perfil_id)
        )?.descripcion;

    /* ---------- Idiomas ---------- */

    const todosIdiomasCompletos = idiomas.every(idiomaCompleto);

    const puedeAgregarIdioma =
        idiomas.length < listaIdiomas.length &&
        todosIdiomasCompletos;

    const nombreIdiomaDe = (i) =>
        listaIdiomas.find(
            (x) => String(x.id) === String(i.idioma_id)
        )?.nombre;

    const idiomaIngles = idiomas.find(
        (i) => esIngles(nombreIdiomaDe(i))
    );

    /* ---------- Validaciones ---------- */

    const perfilesCompletos =
        perfiles.length > 0 &&
        perfiles.every(
            (p) => Boolean(p.perfil_id && p.nivel)
        );

    const inglesCompleto =
        Boolean(idiomaIngles && idiomaCompleto(idiomaIngles));

    const validarAntesDeRegistrar = () => {

        // Validar perfil técnico
        if (!perfiles.length || !perfilesCompletos) {
            toast.error(
                "Debes completar al menos un perfil técnico y asignarle un nivel."
            );

            setPaso(2);
            return false;
        }

        // Validar inglés
        if (!inglesCompleto) {
            toast.error(
                "Debes completar el idioma inglés: lectura, habla y escucha."
            );

            setPaso(2);
            return false;
        }

        // Validar otros idiomas agregados
        if (!todosIdiomasCompletos) {
            toast.error(
                "Completa los niveles de los idiomas que has agregado."
            );

            setPaso(2);
            return false;
        }

        // Validar habilidades blandas
        if (!seleccionadas.length) {
            toast.error(
                "Debes seleccionar al menos una habilidad blanda."
            );

            setPaso(2);
            return false;
        }

        return true;
    };

    /* ---------- Estado de los pasos ---------- */

    const pasoCompleto = (i) => {
        if (i === 0) {
            return [
                "codigo",
                "primer_nombre",
                "primer_apellido",
                "segundo_apellido",
                "telefono",
                "tipo_documento",
                "cedula"
            ].every((c) => String(form[c] || "").trim());
        }

        if (i === 1) {
            return (
                Boolean(String(form.correo || "").trim()) &&
                String(form.password || "").length >= 8 &&
                Boolean(form.cv)
            );
        }

        return (
            perfilesCompletos &&
            seleccionadas.length > 0 &&
            inglesCompleto &&
            todosIdiomasCompletos
        );
    };

    const ultimo = paso === PASOS.length - 1;

    /* ---------- Selección de hoja de vida ---------- */

    const seleccionarCv = (e) => {
        const archivo = e.target.files?.[0];

        if (!archivo) return;

        const extensionPdf = archivo.name
            .toLowerCase()
            .endsWith(".pdf");

        const tipoValido =
            archivo.type === "application/pdf";

        // Validar formato PDF
        if (!extensionPdf || !tipoValido) {
            toast.error("Solo se permiten archivos PDF.");

            setCvError("Solo se permiten archivos PDF.");
            e.target.value = "";
            setCvPendiente(null);

            return;
        }

        // Validar tamaño máximo de 2 MB
        if (archivo.size > MAX_CV_SIZE) {
            toast.error(
                "La hoja de vida no puede superar los 2 MB."
            );

            setCvError("El archivo supera el tamaño máximo permitido de 2 MB.");
            e.target.value = "";
            setCvPendiente(null);

            return;
        }

        setCvError("");
        setCvPendiente(archivo);
        setModalCvAbierto(true);
    };

    const confirmarCv = () => {
        if (!cvPendiente) return;

        handleFileSelect?.(cvPendiente);

        setCvError("");
        setModalCvAbierto(false);
        setCvPendiente(null);

        if (inputCvRef.current) {
            inputCvRef.current.value = "";
        }

        toast.success("Hoja de vida adjuntada correctamente.");
    };

    const cancelarCv = () => {
        setModalCvAbierto(false);
        setCvPendiente(null);

        if (inputCvRef.current) {
            inputCvRef.current.value = "";
        }
    };

    /* ---------- Enviar formulario ---------- */

    const enviarFormulario = async (e) => {
        e.preventDefault();

        if (registrando) return;

        // Validaciones obligatorias antes del registro
        if (!validarAntesDeRegistrar()) return;

        setRegistrando(true);

        try {
            await onSubmit(e);
        } catch (error) {
            console.error("Error al registrar candidato:", error);
            toast.error("Ocurrió un error al registrar. Inténtalo nuevamente.");
        } finally {
            setRegistrando(false);
        }
    };

    const bloquearEnter = (e) => {
        if (
            e.key === "Enter" &&
            !ultimo &&
            e.target.tagName !== "TEXTAREA"
        ) {
            e.preventDefault();
        }
    };

    return (
        <div
            className="w-full bg-cover bg-center bg-fixed min-h-screen md:h-screen md:overflow-hidden"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="bg-white/40 px-4 py-4 min-h-screen md:h-full flex items-center justify-center">

                <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col md:max-h-full overflow-hidden">

                    {/* ============ ENCABEZADO SUPERIOR ============ */}

                    <header className="shrink-0 bg-red-600 text-white px-6 md:px-8 py-6">

                        <div className="relative flex flex-col items-center text-center gap-4">

                            <div className="flex flex-col items-center gap-2">
                                <div>
                                    <h1 className="text-2xl font-extrabold leading-tight">
                                        Registro candidato
                                    </h1>

                                    <p className="text-sm text-red-100 mt-0.5">
                                        Completa tu información personal y tu perfil profesional
                                    </p>
                                </div>
                            </div>

                            {/* Pasos */}

                            <nav className="flex gap-2 w-full max-w-2xl">
                                {PASOS.map(({ titulo, desc, icon: Icon }, i) => {
                                    const activo = paso === i;
                                    const hecho = pasoCompleto(i) && !errorEnPaso(i);

                                    return (
                                        <button
                                            key={titulo}
                                            type="button"
                                            onClick={() => setPaso(i)}
                                            className={`
                                                relative flex flex-1 items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all
                                                ${activo ? "bg-white text-red-600" : "hover:bg-white/10 text-white"}
                                            `}
                                        >
                                            <div className="shrink-0">
                                                {hecho ? (
                                                    <Check size={17} />
                                                ) : (
                                                    <Icon size={17} />
                                                )}
                                            </div>

                                            <div className="hidden md:block pr-1 text-left">
                                                <p className="text-sm font-bold leading-tight">
                                                    {titulo}
                                                </p>

                                                <p className={`text-[11px] ${activo ? "text-gray-500" : "text-red-100"}`}>
                                                    {desc}
                                                </p>
                                            </div>

                                            {errorEnPaso(i) && (
                                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-300 ring-2 ring-red-600" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </header>

                    {/* ============ CONTENIDO ============ */}

                    <form
                        onSubmit={enviarFormulario}
                        onKeyDown={bloquearEnter}
                        className="flex flex-col flex-1 min-w-0 min-h-0 bg-white"
                    >

                        <div className={`flex-1 min-h-0 overflow-y-auto p-6 md:p-8 ${scrollClass}`}>

                            {/* ===== PASO 1 ===== */}

                            {paso === 0 && (
                                <div className="max-w-5xl mx-auto">

                                    <SectionHeader
                                        icon={User}
                                        title="Información personal"
                                        subtitle="Cuéntanos quién eres"
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-5">

                                        <Field label="Primer nombre" error={errors?.primer_nombre}>
                                            <InputWithIcon
                                                icon={User}
                                                name="primer_nombre"
                                                type="text"
                                                placeholder="Primer nombre"
                                                onChange={onChange}
                                                value={form.primer_nombre || ""}
                                                error={errors?.primer_nombre}
                                            />
                                        </Field>

                                        <Field
                                            label={<>Segundo nombre <span className="font-normal text-gray-400">(opcional)</span></>}
                                            error={errors?.segundo_nombre}
                                        >
                                            <InputWithIcon
                                                icon={User}
                                                name="segundo_nombre"
                                                type="text"
                                                placeholder="Segundo nombre"
                                                onChange={onChange}
                                                value={form.segundo_nombre || ""}
                                                error={errors?.segundo_nombre}
                                            />
                                        </Field>

                                        <Field label="Primer apellido" error={errors?.primer_apellido}>
                                            <InputWithIcon
                                                icon={UserRound}
                                                name="primer_apellido"
                                                type="text"
                                                placeholder="Primer apellido"
                                                onChange={onChange}
                                                value={form.primer_apellido || ""}
                                                error={errors?.primer_apellido}
                                            />
                                        </Field>

                                        <Field label="Segundo apellido" error={errors?.segundo_apellido}>
                                            <InputWithIcon
                                                icon={UserRound}
                                                name="segundo_apellido"
                                                type="text"
                                                placeholder="Segundo apellido"
                                                onChange={onChange}
                                                value={form.segundo_apellido || ""}
                                                error={errors?.segundo_apellido}
                                            />
                                        </Field>

                                        <div className="sm:col-span-2 flex gap-3 items-start">

                                            <Field label="Tipo">
                                                <div className="relative">
                                                    <CreditCard
                                                        size={17}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                    />

                                                    <select
                                                        name="tipo_documento"
                                                        value={form.tipo_documento}
                                                        onChange={onChange}
                                                        className={`${selectBase} !w-28 pl-9 ${errors?.tipo_documento ? "!border-red-400 bg-red-50/60" : ""}`}
                                                    >
                                                        <option value="CC">CC</option>
                                                        <option value="CE">CE</option>
                                                        <option value="PA">PA</option>
                                                        <option value="PEP">PEP</option>
                                                    </select>
                                                </div>
                                            </Field>

                                            <div className="flex-1">
                                                <Field label="Documento" error={errors?.cedula || errors?.tipo_documento}>
                                                    <InputWithIcon
                                                        icon={Hash}
                                                        name="cedula"
                                                        type="text"
                                                        placeholder="Ingrese su documento"
                                                        onChange={onChange}
                                                        value={form.cedula || ""}
                                                        error={errors?.cedula}
                                                    />
                                                </Field>
                                            </div>
                                        </div>

                                        <Field label="Código" error={errors?.codigo}>
                                            <InputWithIcon
                                                icon={Hash}
                                                name="codigo"
                                                type="text"
                                                readOnly
                                                placeholder="Código estudiantil"
                                                onChange={onChange}
                                                value={form.codigo || ""}
                                                error={errors?.codigo}
                                            />
                                        </Field>

                                        <Field label="Teléfono" error={errors?.telefono}>
                                            <InputWithIcon
                                                icon={Phone}
                                                name="telefono"
                                                type="text"
                                                placeholder="Ingrese su teléfono"
                                                onChange={onChange}
                                                value={form.telefono || ""}
                                                error={errors?.telefono}
                                            />
                                        </Field>

                                    </div>
                                </div>
                            )}

                            {/* ===== PASO 2 ===== */}

                            {paso === 1 && (
                                <div className="max-w-3xl mx-auto">

                                    <SectionHeader
                                        icon={KeyRound}
                                        title="Cuenta y hoja de vida"
                                        subtitle="Tus credenciales y tu documento"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        <div className="flex flex-col gap-5">

                                            <Field
                                                label="Correo electrónico"
                                                hint="Asignado mediante invitación"
                                                error={errors?.correo}
                                            >
                                                <InputWithIcon
                                                    icon={Mail}
                                                    name="correo"
                                                    type="email"
                                                    readOnly
                                                    placeholder="Correo electrónico"
                                                    onChange={onChange}
                                                    value={form.correo || ""}
                                                    error={errors?.correo}
                                                />
                                            </Field>

                                            <Field label="Contraseña" error={errors?.password}>
                                                <InputWithIcon
                                                    icon={Lock}
                                                    type={verPassword ? "text" : "password"}
                                                    name="password"
                                                    placeholder="Mínimo 8 caracteres"
                                                    onChange={onChange}
                                                    value={form.password || ""}
                                                    error={errors?.password}
                                                    right={
                                                        <button
                                                            type="button"
                                                            onClick={() => setVerPassword((v) => !v)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                                                            title={verPassword ? "Ocultar" : "Mostrar"}
                                                        >
                                                            {verPassword ? (
                                                                <EyeOff size={17} />
                                                            ) : (
                                                                <Eye size={17} />
                                                            )}
                                                        </button>
                                                    }
                                                />
                                            </Field>

                                        </div>

                                        <div className="flex flex-col gap-3">

                                            <Field
                                                label="Hoja de vida (PDF)"
                                                error={errors?.cv || cvError}
                                                hint="PDF de máximo 2 MB. Podrás revisarlo antes de adjuntarlo."
                                            >
                                                <input
                                                    ref={inputCvRef}
                                                    type="file"
                                                    accept=".pdf,application/pdf"
                                                    onChange={seleccionarCv}
                                                    className="hidden"
                                                />

                                                <div className={`rounded-xl border-2 border-dashed p-4 transition-colors ${
                                                    errors?.cv || cvError
                                                        ? "border-red-300 bg-red-50/50"
                                                        : "border-gray-200 bg-gray-50 hover:border-red-300"
                                                }`}>

                                                    {form.cv ? (
                                                        <div className="flex items-center gap-3">

                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                                                <FileCheck size={22} />
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-semibold text-gray-800">
                                                                    {form.cv.name}
                                                                </p>

                                                                <p className="text-xs text-green-600">
                                                                    Hoja de vida adjuntada correctamente
                                                                </p>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => inputCvRef.current?.click()}
                                                                className="shrink-0 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                                            >
                                                                Cambiar
                                                            </button>

                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-center">

                                                            <UploadCloud size={28} className="text-gray-400" />

                                                            <p className="text-sm font-semibold text-gray-700">
                                                                Selecciona tu hoja de vida
                                                            </p>

                                                            <p className="text-xs text-gray-500">
                                                                PDF · Máximo 2 MB
                                                            </p>

                                                            <button
                                                                type="button"
                                                                onClick={() => inputCvRef.current?.click()}
                                                                className="mt-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                                                            >
                                                                Buscar archivo
                                                            </button>

                                                        </div>
                                                    )}
                                                </div>
                                            </Field>

                                            <a
                                                href={formatoCvUrl}
                                                download="Formato Hoja de vida Estudiante.docx"
                                                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:bg-gray-50 transition-colors"
                                            >
                                                <Download size={18} className="shrink-0 text-red-600" />

                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        Descargar formato
                                                    </p>

                                                    <p className="text-xs text-gray-500">
                                                        Llénalo, pásalo a PDF y súbelo aquí
                                                    </p>
                                                </div>

                                                <FileText size={18} className="ml-auto text-gray-300" />
                                            </a>

                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===== PASO 3 ===== */}

                            {paso === 2 && (
                                <div>

                                    <SectionHeader
                                        icon={Briefcase}
                                        title="Perfil profesional"
                                        subtitle="Obligatorio: 1 perfil técnico y 1 habilidad blanda. Inglés obligatorio."
                                    />

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                                        {/* TÉCNICOS */}

                                        <Card
                                            icon={Code2}
                                            title="Perfiles técnicos"
                                            required
                                            note="Mínimo 1"
                                        >

                                            {perfiles.map((perfil, index) => (
                                                <div key={index} className="flex flex-col gap-1">

                                                    <div className="flex gap-2 items-center">

                                                        <select
                                                            value={perfil.perfil_id}
                                                            onChange={(e) => handlePerfilChange(index, "perfil_id", e.target.value)}
                                                            className={selectBase}
                                                        >
                                                            <option value="" disabled>
                                                                Perfil técnico
                                                            </option>

                                                            {listaPerfiles.map((item) => {
                                                                const enOtro = perfiles.some(
                                                                    (p, i) =>
                                                                        i !== index &&
                                                                        String(p.perfil_id) === String(item.id)
                                                                );

                                                                return (
                                                                    <option
                                                                        key={item.id}
                                                                        value={item.id}
                                                                        disabled={enOtro}
                                                                    >
                                                                        {item.nombre}
                                                                    </option>
                                                                );
                                                            })}
                                                        </select>

                                                        <select
                                                            value={perfil.nivel}
                                                            onChange={(e) => handlePerfilChange(index, "nivel", e.target.value)}
                                                            className={`${selectBase} !w-32`}
                                                        >
                                                            <option value="" disabled>
                                                                Nivel
                                                            </option>

                                                            {nivelesPerfil.map((n) => (
                                                                <option key={n.value} value={n.value}>
                                                                    {n.label}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {perfiles.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePerfil(index)}
                                                                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Eliminar perfil"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}

                                                    </div>

                                                    {descripcionPerfil(perfil) && (
                                                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                                                            {descripcionPerfil(perfil)}
                                                        </p>
                                                    )}

                                                </div>
                                            ))}

                                            {perfiles.length < listaPerfiles.length &&
                                                perfiles.every((p) => p.perfil_id && p.nivel) && (
                                                    <button
                                                        type="button"
                                                        onClick={addPerfil}
                                                        className={ghostAdd}
                                                    >
                                                        <Plus size={15} /> Agregar perfil
                                                    </button>
                                                )}

                                            <FieldError message={errors?.perfiles} />

                                        </Card>

                                        {/* BLANDAS */}

                                        <Card
                                            icon={Sparkles}
                                            title="Habilidades blandas"
                                            required
                                            note={seleccionadas.length ? `${seleccionadas.length} elegidas` : "Mínimo 1"}
                                        >

                                            {seleccionadas.length > 0 && (
                                                <div className={`flex flex-wrap gap-1.5 max-h-28 overflow-y-auto ${scrollClass}`}>

                                                    {seleccionadas.map((h) => (
                                                        <span
                                                            key={h.index}
                                                            className="inline-flex items-center gap-1 max-w-full pl-2.5 pr-1 py-1 rounded-full bg-gray-800 text-white text-xs font-medium"
                                                        >
                                                            <span className="truncate">
                                                                {nombreDeHabilidad(h)}
                                                            </span>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeHabilidadBlanda(h.index)}
                                                                className="shrink-0 p-0.5 rounded-full hover:bg-white/25 transition-colors"
                                                                title="Quitar"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </span>
                                                    ))}

                                                </div>
                                            )}

                                            <FieldError message={errors?.habilidades} />

                                            {disponibles.length > 0 && (
                                                <div className="flex flex-col gap-2">

                                                    <span className="text-xs text-gray-400">
                                                        Toca para agregar
                                                    </span>

                                                    <div className={`flex flex-wrap gap-1.5 max-h-28 overflow-y-auto ${scrollClass}`}>

                                                        {disponibles.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    addHabilidadBlanda({
                                                                        habilidad_blanda_id: item.id,
                                                                        nombre: ""
                                                                    })
                                                                }
                                                                title={item.descripcion || item.nombre}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs hover:bg-gray-100 hover:border-gray-300 hover:text-gray-900 transition-colors"
                                                            >
                                                                <Plus size={11} />
                                                                <span className="truncate max-w-[10rem]">
                                                                    {item.nombre}
                                                                </span>
                                                            </button>
                                                        ))}

                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 pt-1">

                                                <input
                                                    type="text"
                                                    value={nuevaHabilidad}
                                                    onChange={(e) => setNuevaHabilidad(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            agregarNueva();
                                                        }
                                                    }}
                                                    placeholder="Otra habilidad..."
                                                    maxLength={80}
                                                    className="flex-1 min-w-0 rounded-lg px-3 py-2 text-sm border border-gray-200 shadow-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={agregarNueva}
                                                    disabled={!nuevaHabilidad.trim()}
                                                    className="p-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                                                    title="Agregar"
                                                >
                                                    <Plus size={16} />
                                                </button>

                                            </div>

                                        </Card>

                                        {/* IDIOMAS */}

                                        <Card
                                            icon={Languages}
                                            title="Idiomas"
                                            note="Inglés obligatorio"
                                        >

                                            {idiomas.map((idioma, index) => {

                                                const nombreIdioma = listaIdiomas.find(
                                                    (x) => String(x.id) === String(idioma.idioma_id)
                                                )?.nombre;

                                                const bloqueado = esIngles(nombreIdioma);

                                                return (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col gap-2 rounded-lg bg-gray-50/80 p-2.5"
                                                    >

                                                        <div className="flex items-center gap-2">

                                                            <select
                                                                value={idioma.idioma_id}
                                                                disabled={bloqueado}
                                                                onChange={(e) => handleIdiomaChange(index, "idioma_id", e.target.value)}
                                                                className={`${selectBase} ${bloqueado ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                                                            >
                                                                <option value="" disabled>
                                                                    Seleccionar idioma
                                                                </option>

                                                                {listaIdiomas.map((item) => {
                                                                    const enOtro = idiomas.some(
                                                                        (i, idx) =>
                                                                            idx !== index &&
                                                                            String(i.idioma_id) === String(item.id)
                                                                    );

                                                                    return (
                                                                        <option
                                                                            key={item.id}
                                                                            value={item.id}
                                                                            disabled={enOtro}
                                                                        >
                                                                            {item.nombre}
                                                                        </option>
                                                                    );
                                                                })}

                                                            </select>

                                                            {!bloqueado && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeIdioma(index)}
                                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                    title="Eliminar idioma"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}

                                                        </div>

                                                        <div className="grid grid-cols-3 gap-2">

                                                            {[
                                                                { field: "lee", label: "Lectura" },
                                                                { field: "habla", label: "Habla" },
                                                                { field: "escucha", label: "Escucha" }
                                                            ].map(({ field, label }) => {

                                                                const Icono = nivelesIcono[field];

                                                                return (
                                                                    <div key={field} className="flex flex-col gap-1">

                                                                        <label className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                                                                            <Icono size={11} className="text-gray-400" />
                                                                            {label}
                                                                        </label>

                                                                        <select
                                                                            value={idioma[field]}
                                                                            onChange={(e) => handleIdiomaChange(index, field, e.target.value)}
                                                                            className="w-full rounded-lg px-1.5 py-1.5 text-xs bg-white border border-gray-200 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
                                                                        >
                                                                            <option value="" disabled>
                                                                                Nivel
                                                                            </option>

                                                                            {nivelesIdioma.map((n) => (
                                                                                <option key={n.value} value={n.value}>
                                                                                    {n.label}
                                                                                </option>
                                                                            ))}

                                                                        </select>

                                                                    </div>
                                                                );
                                                            })}

                                                        </div>

                                                    </div>
                                                );
                                            })}

                                            <FieldError message={errors?.idiomas} />

                                            {idiomas.length < listaIdiomas.length && (
                                                <div className="flex flex-col gap-1">

                                                    <button
                                                        type="button"
                                                        onClick={addIdioma}
                                                        disabled={!puedeAgregarIdioma}
                                                        className={`${ghostAdd} disabled:text-gray-300 disabled:pointer-events-none`}
                                                    >
                                                        <Plus size={15} /> Agregar otro idioma
                                                    </button>

                                                    {!todosIdiomasCompletos && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-400">
                                                            <Info size={12} />
                                                            Completa el idioma actual para agregar otro
                                                        </span>
                                                    )}

                                                </div>
                                            )}

                                        </Card>

                                    </div>
                                </div>
                            )}

                        </div>

                        {/* ============ PIE ============ */}

                        <div className="border-t border-gray-100 bg-white/80 px-6 md:px-8 py-4 flex flex-col gap-2">

                            {backendError && (
                                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    {backendError}
                                </div>
                            )}

                            <div className="flex items-center justify-between">

                                <button
                                    type="button"
                                    onClick={() => setPaso((p) => Math.max(0, p - 1))}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-colors ${paso === 0 ? "invisible" : ""}`}
                                >
                                    <ChevronLeft size={16} />
                                    Atrás
                                </button>

                                {ultimo ? (

                                    <button
                                        type="submit"
                                        disabled={registrando}
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-lg px-8 py-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                                    >
                                        {registrando ? (
                                            <>
                                                <LoaderCircle size={16} className="animate-spin" />
                                                Registrando...
                                            </>
                                        ) : (
                                            "Registrar"
                                        )}
                                    </button>

                                ) : (

                                    <button
                                        type="button"
                                        onClick={() => setPaso((p) => Math.min(PASOS.length - 1, p + 1))}
                                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-lg pl-6 pr-4 py-2.5 transition-all"
                                    >
                                        Siguiente
                                        <ChevronRight size={16} />
                                    </button>

                                )}

                            </div>
                        </div>

                    </form>
                </div>
            </div>

            {/* ============ MODAL DE VISTA PREVIA DE HOJA DE VIDA ============ */}

            {modalCvAbierto && cvPendiente && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) cancelarCv();
                    }}
                >

                    <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">

                            <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                    <FileText size={21} />
                                </div>

                                <div className="min-w-0">
                                    <h2 className="font-bold text-gray-900">
                                        Vista previa de hoja de vida
                                    </h2>

                                    <p className="truncate text-xs text-gray-500">
                                        {cvPendiente.name}
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={cancelarCv}
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Cerrar vista previa"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="min-h-0 flex-1 bg-gray-100 p-2 sm:p-4">

                            {cvPreviewUrl ? (
                                <iframe
                                    src={cvPreviewUrl}
                                    title="Vista previa del documento PDF"
                                    className="h-[55vh] min-h-[300px] w-full rounded-lg border border-gray-200 bg-white"
                                />
                            ) : (
                                <div className="flex h-[55vh] items-center justify-center text-sm text-gray-500">
                                    Preparando vista previa...
                                </div>
                            )}

                        </div>

                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                            <p className="text-xs text-gray-500">
                                Revisa que el documento sea correcto antes de adjuntarlo.
                            </p>

                            <div className="flex justify-end gap-2">

                                <button
                                    type="button"
                                    onClick={cancelarCv}
                                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={confirmarCv}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                                >
                                    <Check size={16} />
                                    Usar esta hoja de vida
                                </button>

                            </div>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
