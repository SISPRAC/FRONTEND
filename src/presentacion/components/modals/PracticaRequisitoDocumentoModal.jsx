import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { tipoRequisitoDocumentoRepository } from "../../../infraestructura/repository/tipoRequisitoDocumentoRepository.js";

import { obtenerTiposRequisitoDocumento } from "../../../aplicacion/tipoRequisitoDocumento/obtenerTiposRequisitoDocumento.js";


export default function PracticaRequisitoDocumentoModal({
    isOpen,
    onClose,
    onSubmit,
    requisito = null,
    practicaId,
    practicaNombre
}) {

    const [tiposRequisito, setTiposRequisito] = useState([]);

    const [isSaving, setIsSaving] = useState(false);

    const [errors, setErrors] = useState({
        tipo_requisito_documento_id: false,
        fecha_limite: false
    });


    const [form, setForm] = useState({
        tipo_requisito_documento_id: "",
        fecha_inicio: "",
        fecha_limite: "",
        estado: true
    });


    const esEdicion = Boolean(requisito);


    useEffect(() => {

        if (!isOpen) return;

        loadTiposRequisitoDocumento();

        if (requisito) {

            setForm({
                tipo_requisito_documento_id:
                    requisito.tipo_requisito_documento_id || "",

                fecha_inicio:
                    requisito.fecha_inicio || "",

                fecha_limite:
                    requisito.fecha_limite || "",

                estado:
                    requisito.estado
            });

        } else {

            setForm({
                tipo_requisito_documento_id: "",
                fecha_inicio: "",
                fecha_limite: "",
                estado: true
            });

        }

        setErrors({
            tipo_requisito_documento_id: false,
            fecha_limite: false
        });

    }, [isOpen, requisito]);


    const loadTiposRequisitoDocumento = async () => {

        try {

            const data =
                await obtenerTiposRequisitoDocumento({
                    tipoRequisitoDocumentoRepository
                });

            setTiposRequisito(data);

        } catch (error) {

            console.log(error);

            toast.error(
                "Error al cargar los tipos de requisitos documentales"
            );

        }

    };


    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        if (type === "checkbox") {

            setForm({
                ...form,
                [name]: checked
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

            tipo_requisito_documento_id:
                !form.tipo_requisito_documento_id,

            fecha_limite:
                !form.fecha_limite

        };


        setErrors(nuevosErrores);


        if (
            Object.values(nuevosErrores).some(Boolean)
        ) {

            toast.error(
                "Complete los campos obligatorios"
            );

            return;

        }


        try {

            setIsSaving(true);


            await onSubmit({

                ...(requisito && {
                    id: requisito.id
                }),

                ...form,

                practica_id: practicaId

            });

        } finally {

            setIsSaving(false);

        }

    };


    if (!isOpen) return null;


    const tipoSeleccionado =
        tiposRequisito.find(
            tipo =>
                tipo.id === Number(
                    form.tipo_requisito_documento_id
                )
        );


    const campoError = (campo) => (

        errors[campo]
            ? "border-red-500 ring-2 ring-red-100"
            : ""

    );


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
                className="
                    bg-white
                    w-full
                    max-w-4xl
                    max-h-[95vh]
                    overflow-y-auto
                    rounded-2xl
                    shadow-xl
                    p-6
                    sm:p-8
                    relative
                "
            >

                <button
                    type="button"
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
                    {
                        esEdicion
                            ? "Editar Requisito Documental"
                            : "Nuevo Requisito Documental"
                    }
                </h2>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Práctica */}

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


                    {/* Tipo de documento */}

                    <div>

                        <label className="font-medium">
                            Tipo de documento
                        </label>

                        <select
                            name="tipo_requisito_documento_id"
                            value={
                                form.tipo_requisito_documento_id
                            }
                            onChange={handleChange}
                            className={`
                                w-full
                                mt-2
                                border
                                rounded-xl
                                p-3
                                ${campoError(
                                    "tipo_requisito_documento_id"
                                )}
                            `}
                        >

                            <option value="">
                                Seleccione un documento...
                            </option>


                            {
                                tiposRequisito.map(
                                    tipo => (

                                        <option
                                            key={tipo.id}
                                            value={tipo.id}
                                        >
                                            {tipo.nombre}
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>


                    {/* Información del tipo seleccionado */}

                    {
                        tipoSeleccionado && (

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    p-5
                                    space-y-4
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Documento
                                    </p>

                                    <p
                                        className="
                                            font-semibold
                                            text-slate-700
                                        "
                                    >
                                        {
                                            tipoSeleccionado.nombre
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p
                                        className="
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Descripción
                                    </p>

                                    <p
                                        className="
                                            text-sm
                                            text-slate-600
                                        "
                                    >
                                        {
                                            tipoSeleccionado.descripcion ||
                                            "Sin descripción"
                                        }
                                    </p>

                                </div>


                                <div>

                                    <p
                                        className="
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Rol
                                    </p>

                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-slate-700
                                        "
                                    >
                                        {
                                            tipoSeleccionado.rol?.nombre ||
                                            "Sin rol"
                                        }
                                    </p>

                                </div>


                                {
                                    tipoSeleccionado.plantilla && (

                                        <div>

                                            <p
                                                className="
                                                    text-xs
                                                    text-slate-400
                                                "
                                            >
                                                Plantilla
                                            </p>

                                            <a
                                                href={
                                                    tipoSeleccionado.plantilla.url
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="
                                                    text-sm
                                                    text-blue-600
                                                    underline
                                                "
                                            >
                                                {
                                                    tipoSeleccionado.plantilla.nombre
                                                }
                                            </a>

                                        </div>

                                    )
                                }

                            </div>

                        )
                    }


                    {/* Fechas */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2
                            gap-5
                        "
                    >

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
                                    ${campoError(
                                        "fecha_limite"
                                    )}
                                `}
                            />

                        </div>

                    </div>


                    {/* Estado */}

                    <div>

                        <label
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <input
                                type="checkbox"
                                name="estado"
                                checked={form.estado}
                                onChange={handleChange}
                            />

                            Activo

                        </label>

                    </div>


                    {/* Botones */}

                    <div
                        className="
                            flex
                            justify-end
                            gap-3
                            pt-3
                        "
                    >

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

                            {
                                isSaving && (

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

                                )
                            }

                            {
                                isSaving
                                    ? "Guardando..."
                                    : "Guardar"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}