import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getRoles } from "../../../aplicacion/rol/getRoles.js";
import { rolRepository } from "../../../infraestructura/repository/rolRepository.js";

export default function PracticaRequisitoDocumentoModal({
    isOpen,
    onClose,
    onSubmit,
    requisito = null,
    practicaId,
    practicaNombre
}) {

    const [roles, setRoles] = useState([]);
    const [archivoActual, setArchivoActual] = useState(null);
    const [previewNuevoArchivo, setPreviewNuevoArchivo] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({
        rol_id: false,
        nombre: false,
        fecha_limite: false
    });

    const [form, setForm] = useState({
        rol_id: "",
        nombre: "",
        descripcion: "",
        archivo: null,
        fecha_inicio: "",
        fecha_limite: "",
        obligatorio: true,
        estado: true
    });

    const esEdicion = Boolean(requisito);
    const tienePlantilla = Boolean(archivoActual);

    useEffect(() => {

        if (!isOpen) return;

        loadRoles();

        if (requisito) {

            setForm({
                rol_id: requisito.rol_id || "",
                nombre: requisito.nombre || "",
                descripcion: requisito.descripcion || "",
                archivo: null,
                fecha_inicio: requisito.fecha_inicio || "",
                fecha_limite: requisito.fecha_limite || "",
                obligatorio: requisito.obligatorio,
                estado: requisito.estado
            });

            setArchivoActual(requisito.plantilla || null);

        } else {

            setForm({
                rol_id: "",
                nombre: "",
                descripcion: "",
                archivo: null,
                fecha_inicio: "",
                fecha_limite: "",
                obligatorio: true,
                estado: true
            });

            setArchivoActual(null);
        }

        setPreviewNuevoArchivo(null);

        setErrors({
            rol_id: false,
            nombre: false,
            fecha_limite: false
        });

    }, [isOpen, requisito]);

    // Genera y libera la URL local para previsualizar el archivo recién seleccionado
    useEffect(() => {

        if (!form.archivo) {

            setPreviewNuevoArchivo(null);
            return;

        }

        const url = URL.createObjectURL(form.archivo);

        setPreviewNuevoArchivo(url);

        return () => URL.revokeObjectURL(url);

    }, [form.archivo]);

    const loadRoles = async () => {

        try {

            const data = await getRoles(rolRepository);

            setRoles(data.roles);

        } catch {

            toast.error("Error al cargar los roles");

        }

    };

    const handleChange = (e) => {

        const { name, value, type, checked, files } = e.target;

        if (type === "checkbox") {

            setForm({
                ...form,
                [name]: checked
            });

            return;

        }

        if (type === "file") {

            const file = files[0];

            if (!file) return;

            const extensionesPermitidas = [
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ];

            if (!extensionesPermitidas.includes(file.type)) {

                toast.error("Solo se permiten archivos PDF, DOC y DOCX");

                e.target.value = "";

                return;

            }

            setForm({
                ...form,
                archivo: file
            });

            return;
        }

        setForm({
            ...form,
            [name]: value
        });

        if (errors[name]) {

            setErrors({
                ...errors,
                [name]: false
            });

        }

    };

    const handleClose = () => {

        onClose();

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const nuevosErrores = {
            rol_id: !form.rol_id,
            nombre: !form.nombre.trim(),
            fecha_limite: !form.fecha_limite
        };

        setErrors(nuevosErrores);

        if (Object.values(nuevosErrores).some(Boolean))
            return toast.error("Complete los campos obligatorios");

        try {

            setIsSaving(true);

            await onSubmit({

                ...(requisito && { id: requisito.id }),
                ...form,
                practica_id: practicaId

            });

        } finally {

            setIsSaving(false);

        }

    };

    if (!isOpen) return null;

    // Determina si hay algo que mostrar en el panel de vista previa
    const mostrarPanelPreview = esEdicion && (tienePlantilla || previewNuevoArchivo);

    const esPDF = (nombreOUrl) => {

        if (!nombreOUrl) return false;

        return nombreOUrl.toLowerCase().split("?")[0].endsWith(".pdf");

    };

    // Devuelve las clases del borde/sombra roja cuando el campo tiene error
    const campoError = (campo) => (errors[campo] ? "border-red-500 ring-2 ring-red-100" : "");

    // Bloque de botones reutilizable, para no repetir el markup en cada layout
    const renderBotones = (wrapperClassName) => (

        <div className={wrapperClassName}>

            <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="
                    px-6
                    py-2
                    rounded-xl
                    bg-slate-200
                    hover:bg-slate-300
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                "
            >
                Cancelar
            </button>

            <button
                type="submit"
                disabled={isSaving}
                className="
                    px-6
                    py-2
                    rounded-xl
                    bg-[#e8192c]
                    text-white
                    hover:bg-[#c8111f]
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                    flex
                    items-center
                    gap-2
                "
            >

                {isSaving && (

                    <span
                        className="
                            h-4
                            w-4
                            rounded-full
                            border-2
                            border-white/40
                            border-t-white
                            animate-spin
                        "
                    />

                )}

                {isSaving ? "Guardando..." : "Guardar"}

            </button>

        </div>

    );

    const previewUrl = previewNuevoArchivo || archivoActual?.url;
    const previewNombre = form.archivo?.name || archivoActual?.nombre;
    const previewEsPDF = form.archivo
        ? form.archivo.type === "application/pdf"
        : esPDF(archivoActual?.nombre || archivoActual?.url);

    return (

        <div
            className="
                fixed
                inset-0
                bg-black/40
                flex
                items-center
                justify-center
                z-50
                p-4
            "
        >

            <div
                className={`
                    bg-white
                    w-full
                    ${mostrarPanelPreview ? "max-w-6xl" : "max-w-5xl"}
                    max-h-[100vh]
                    overflow-y-auto
                    rounded-2xl
                    shadow-xl
                    p-6
                    sm:p-8
                    relative
                    transition-[max-width]
                `}
            >

                <button
                    onClick={handleClose}
                    className="
                        absolute
                        right-4
                        top-4
                        text-slate-400
                        hover:text-red-500
                    "
                >
                    ✕
                </button>

                <h2
                    className="
                        text-2xl
                        font-bold
                        text-center
                        text-[#e8192c]
                        mb-8
                    "
                >
                    {requisito
                        ? "Editar Requisito Documental"
                        : "Nuevo Requisito Documental"}
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className={
                        mostrarPanelPreview
                            ? "grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6"
                            : ""
                    }
                >

                    {/* Columna del formulario */}

                    <div className="space-y-6">

                        {/* Primera fila */}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                            <div>

                                <label className="font-medium">

                                    Práctica

                                </label>

                                <input
                                    type="text"
                                    value={practicaNombre}
                                    disabled
                                    className="
                        w-full
                        mt-2
                        rounded-xl
                        border
                        bg-slate-100
                        text-slate-600
                        p-3
                        cursor-not-allowed
                    "
                                />

                            </div>

                            <div>

                                <label className="font-medium">

                                    Documento

                                </label>

                                <input
                                    type="text"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej. Formato de solicitud de práctica"
                                    className={`
                                        w-full
                                        mt-2
                                        border
                                        rounded-xl
                                        p-3
                                        ${campoError("nombre")}
                                    `}
                                />

                            </div>

                            <div>

                                <label className="font-medium">

                                    Rol

                                </label>

                                <select
                                    name="rol_id"
                                    value={form.rol_id}
                                    onChange={handleChange}
                                    className={`
                                        w-full
                                        mt-2
                                        border
                                        rounded-xl
                                        p-3
                                        ${campoError("rol_id")}
                                    `}
                                >

                                    <option value="" disabled>
                                        Seleccione...
                                    </option>

                                    {
                                        roles.map((rol) => (

                                            <option
                                                key={rol.id}
                                                value={rol.id}
                                            >
                                                {rol.nombre}
                                            </option>

                                        ))
                                    }

                                </select>

                            </div>

                        </div>

                        {/* Segunda fila */}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

                            <div>

                                <label className="font-medium">

                                    Fecha inicio

                                </label>

                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    value={form.fecha_inicio}
                                    onChange={handleChange}
                                    className="
                        w-full
                        mt-2
                        border
                        rounded-xl
                        p-3
                    "
                                />

                            </div>

                            <div>

                                <label className="font-medium">

                                    Fecha límite

                                </label>

                                <input
                                    type="date"
                                    name="fecha_limite"
                                    value={form.fecha_limite}
                                    onChange={handleChange}
                                    className={`
                                        w-full
                                        mt-2
                                        border
                                        rounded-xl
                                        p-3
                                        ${campoError("fecha_limite")}
                                    `}
                                />

                            </div>

                            <div className="flex items-end gap-8 pb-3">

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        name="obligatorio"
                                        checked={form.obligatorio}
                                        onChange={handleChange}
                                    />

                                    Obligatorio

                                </label>

                                <label className="flex items-center gap-2">

                                    <input
                                        type="checkbox"
                                        name="estado"
                                        checked={form.estado}
                                        onChange={handleChange}
                                    />

                                    Activo

                                </label>

                            </div>

                        </div>

                        {/* Descripción */}

                        <div>

                            <label className="font-medium">

                                Descripción

                            </label>

                            <textarea
                                rows="3"
                                name="descripcion"
                                value={form.descripcion}
                                onChange={handleChange}
                                placeholder="Ingrese una descripción del documento..."
                                className="
            w-full
            mt-2
            border
            rounded-xl
            p-3
            resize-none
        "
                            />

                        </div>

                        {/* Plantilla */}

                        <div>

                            <label className="font-medium">
                                {esEdicion ? "Reemplazar plantilla" : "Plantilla"}
                            </label>

                            <input
                                type="file"
                                name="archivo"
                                accept=".pdf,.doc,.docx"
                                onChange={handleChange}
                                className="
                w-full
                mt-2
                border
                rounded-xl
                p-3
            "
                            />

                            {form.archivo && (

                                <p className="mt-2 text-sm text-emerald-600">
                                    Nuevo archivo seleccionado: {form.archivo.name}
                                </p>

                            )}

                            {/* En modo creación (o sin panel lateral) el enlace al archivo actual va aquí */}

                            {!mostrarPanelPreview && archivoActual && (

                                <div className="mt-4">

                                    <p className="font-medium">
                                        Archivo actual:
                                    </p>

                                    <a
                                        href={archivoActual.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 underline"
                                    >
                                        {archivoActual.nombre}
                                    </a>

                                </div>

                            )}

                        </div>

                        {/* Botones: junto al formulario, solo en pantallas grandes con panel de PDF */}

                        {mostrarPanelPreview && renderBotones("hidden lg:flex justify-end gap-3 pt-3")}

                    </div>

                    {/* Columna de vista previa (solo edición con archivo disponible) */}

                    {mostrarPanelPreview && (

                        <div
                            className="
                                border
                                border-slate-200
                                rounded-2xl
                                overflow-hidden
                                flex
                                flex-col
                                bg-slate-50
                                h-[380px]
                                lg:h-full
                                lg:min-h-[420px]
                            "
                        >

                            <div
                                className="
                                    px-4
                                    py-3
                                    border-b
                                    border-slate-200
                                    bg-white
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                "
                            >

                                <p className="text-sm font-medium truncate">
                                    {previewNombre}
                                </p>

                                <a
                                    href={previewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="
                                        text-xs
                                        font-medium
                                        text-blue-600
                                        underline
                                        whitespace-nowrap
                                    "
                                >
                                    Abrir en pestaña
                                </a>

                            </div>

                            <div className="flex-1 min-h-0">

                                {previewEsPDF ? (

                                    <iframe
                                        src={previewUrl}
                                        title={previewNombre || "Plantilla"}
                                        className="w-full h-full"
                                    />

                                ) : (

                                    <div
                                        className="
                                            w-full
                                            h-full
                                            flex
                                            flex-col
                                            items-center
                                            justify-center
                                            gap-2
                                            text-center
                                            px-6
                                        "
                                    >

                                        <span className="text-4xl">📄</span>

                                        <p className="text-sm text-slate-500">
                                            Este tipo de archivo no se puede previsualizar aquí.
                                        </p>

                                        <a
                                            href={previewUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm text-blue-600 underline"
                                        >
                                            Descargar / abrir {previewNombre}
                                        </a>

                                    </div>

                                )}

                            </div>

                        </div>

                    )}

                    {/* Botones: en modo creación siempre; con panel de PDF solo en pantallas pequeñas */}

                    {renderBotones(
                        mostrarPanelPreview
                            ? "flex lg:hidden justify-end gap-3 pt-3 col-span-full"
                            : "flex justify-end gap-3 pt-3"
                    )}

                </form>

            </div>

        </div>

    );

}