import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../shared/Layouts/Layout";
import { userRepository } from "../../infraestructura/repository/userRepository";
import { actualizarPerfil } from "../../aplicacion/usuario/actualizarPerfil";


const tiposDocumento = ["CC", "CE", "PEP", "PA"];

const generos = [
    "Masculino",
    "Femenino",
    "Otro"
];

// Campos que siempre son obligatorios
const CAMPOS_OBLIGATORIOS_BASE = [
    "nombres",
    "apellidos",
    "tipo_documento",
    "cedula",
    "telefono"
];

// Campos obligatorios solo si el usuario es practicante
const CAMPOS_OBLIGATORIOS_PRACTICANTE = [
    "eps",
    "fecha_nacimiento",
    "genero",
    "codigoDepResidencia",
    "codigoMunResidencia",
    "direccion"
];


function FieldRow({
    label,
    name,
    type = "text",
    value,
    onChange,
    readOnly = false,
    disabled = false,
    options = null,
    placeholder = "",
    required = false,
    error = false
}) {

    const bloqueado = readOnly || disabled;

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
                {label}
                {required && (
                    <span className="ml-0.5 text-red-500">*</span>
                )}
            </label>

            {options ? (
                <select
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                        ${disabled
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                            : error
                                ? "border-red-400 bg-white text-gray-700 ring-2 ring-red-100"
                                : "border-gray-200 bg-white text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        }
                    `}
                >
                    <option value="" disabled>
                        {placeholder || "Seleccione..."}
                    </option>

                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    name={name}
                    type={type}
                    value={value || ""}
                    onChange={onChange}
                    readOnly={bloqueado}
                    placeholder={placeholder}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition
                        ${bloqueado
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                            : error
                                ? "border-red-400 bg-white text-gray-700 ring-2 ring-red-100"
                                : "border-gray-200 bg-white text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        }
                    `}
                />
            )}

            {error && !bloqueado && (
                <span className="text-xs font-medium text-red-500">
                    Este campo es obligatorio
                </span>
            )}
        </div>
    );
}


function FieldLarge({
    label,
    name,
    value,
    onChange,
    readOnly = false,
    placeholder = "",
    required = false,
    error = false
}) {
    return (
        <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">
                {label}
                {required && (
                    <span className="ml-0.5 text-red-500">*</span>
                )}
            </label>

            <textarea
                name={name}
                value={value || ""}
                onChange={onChange}
                readOnly={readOnly}
                placeholder={placeholder}
                rows={3}
                className={`w-full resize-none rounded-xl border px-4 py-2.5 text-sm outline-none transition
                    ${readOnly
                        ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-500"
                        : error
                            ? "border-red-400 bg-white text-gray-700 ring-2 ring-red-100"
                            : "border-gray-200 bg-white text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    }
                `}
            />

            {error && !readOnly && (
                <span className="text-xs font-medium text-red-500">
                    Este campo es obligatorio
                </span>
            )}
        </div>
    );
}


export default function ActualizarPerfil() {

    const navigate = useNavigate();

    const [form, setForm] = useState({});

    const [perfilOriginal, setPerfilOriginal] = useState({});

    const [errors, setErrors] = useState({});

    const [esPracticante, setEsPracticante] = useState(false);

    const [editando, setEditando] = useState(false);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);


    useEffect(() => {

        const cargarPerfil = async () => {

            try {

                setLoading(true);

                const usuario = await userRepository.getMe();

                const candidato = usuario?.candidato;
                const practicante = candidato?.practicante;

                setEsPracticante(!!practicante);

                const datosPerfil = {
                    nombres: usuario?.nombres || "",
                    apellidos: usuario?.apellidos || "",
                    correo: usuario?.correo || "",
                    tipo_documento: usuario?.tipo_documento || "",
                    cedula: usuario?.cedula || "",
                    telefono: usuario?.telefono || "",

                    codigo: candidato?.codigo || "",

                    eps: practicante?.eps || "",
                    codigoDepResidencia:
                        practicante?.codigoDepResidencia || "",
                    codigoMunResidencia:
                        practicante?.codigoMunResidencia || "",
                    fecha_nacimiento:
                        practicante?.fecha_nacimiento || "",
                    genero: practicante?.genero || "",
                    direccion: practicante?.direccion || ""
                };

                setForm(datosPerfil);
                setPerfilOriginal(datosPerfil);

            } catch (error) {

                console.error(
                    "Error cargando perfil:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "No se pudo cargar el perfil"
                );

            } finally {

                setLoading(false);

            }
        };

        cargarPerfil();

    }, []);


    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value
        }));

        // Si el campo tenía marca de error y el usuario ya escribió algo, se quita
        if (errors[name] && value.trim() !== "") {
            setErrors((prev) => ({
                ...prev,
                [name]: false
            }));
        }

    };


    const validarFormulario = () => {

        const camposRequeridos = [
            ...CAMPOS_OBLIGATORIOS_BASE,
            ...(esPracticante ? CAMPOS_OBLIGATORIOS_PRACTICANTE : [])
        ];

        const nuevosErrores = {};
        let hayErrores = false;

        camposRequeridos.forEach((campo) => {

            const valor = form[campo];

            if (!valor || String(valor).trim() === "") {
                nuevosErrores[campo] = true;
                hayErrores = true;
            }

        });

        setErrors(nuevosErrores);

        return !hayErrores;

    };


    const handleActivarEdicion = () => {
        setEditando(true);
    };


    const handleCancelarEdicion = () => {
        setForm(perfilOriginal);
        setErrors({});
        setEditando(false);
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        const esValido = validarFormulario();

        if (!esValido) {
            toast.error(
                "Completa los campos obligatorios marcados en rojo"
            );
            return;
        }

        try {

            setSaving(true);

            await actualizarPerfil(
                { userRepository },
                form
            );

            toast.success(
                "Perfil actualizado correctamente"
            );

            const rolActivo = localStorage.getItem("rolActivo");

            if (rolActivo === "Practicante") {
                navigate("/homePracticante", { replace: true });
            } 

            setPerfilOriginal(form);
            setEditando(false);

        } catch (error) {

            console.error(
                "Error actualizando perfil:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "No se pudo actualizar el perfil"
            );

        } finally {

            setSaving(false);

        }
    };


    if (loading) {
        return (
            <Layout>
                <div className="flex min-h-[70vh] items-center justify-center">
                    <p className="text-sm text-gray-500">
                        Cargando perfil...
                    </p>
                </div>
            </Layout>
        );
    }


    return (
        <Layout>

            <div className="mx-auto w-full max-w-5xl px-4 py-8">

                {/* ENCABEZADO */}

                <div className="mb-8 flex items-start justify-between gap-4">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Mi perfil
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            {editando
                                ? "Edita tu información y guarda los cambios."
                                : "Actualiza tu información personal y los datos asociados a tu perfil."}
                        </p>

                    </div>

                    {!editando && (
                        <button
                            type="button"
                            onClick={handleActivarEdicion}
                            className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                            Editar perfil
                        </button>
                    )}

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* INFORMACIÓN PERSONAL */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">

                        <div className="mb-6">

                            <h2 className="text-lg font-semibold text-gray-800">
                                Información personal
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Información básica de tu cuenta.
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            <FieldRow
                                label="Nombres"
                                name="nombres"
                                value={form.nombres}
                                onChange={handleChange}
                                disabled={!editando}
                                placeholder="Ej: Juan Camilo"
                                required
                                error={errors.nombres}
                            />

                            <FieldRow
                                label="Apellidos"
                                name="apellidos"
                                value={form.apellidos}
                                onChange={handleChange}
                                disabled={!editando}
                                placeholder="Ej: Pérez Gómez"
                                required
                                error={errors.apellidos}
                            />

                            <FieldRow
                                label="Tipo de documento"
                                name="tipo_documento"
                                value={form.tipo_documento}
                                onChange={handleChange}
                                disabled={!editando}
                                options={tiposDocumento}
                                placeholder="Seleccione un tipo"
                                required
                                error={errors.tipo_documento}
                            />

                            <FieldRow
                                label="Número de documento"
                                name="cedula"
                                value={form.cedula}
                                onChange={handleChange}
                                disabled={!editando}
                                placeholder="Ej: 1091234567"
                                required
                                error={errors.cedula}
                            />

                            <FieldRow
                                label="Teléfono"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                disabled={!editando}
                                placeholder="Ej: 3001234567"
                                required
                                error={errors.telefono}
                            />

                            <FieldRow
                                label="Correo electrónico"
                                name="correo"
                                value={form.correo}
                                readOnly
                                placeholder="correo@ejemplo.com"
                            />

                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            El correo electrónico es asignado mediante
                            invitación y no puede modificarse.
                        </p>

                    </section>


                    {/* INFORMACIÓN DEL CANDIDATO */}

                    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">

                        <div className="mb-6">

                            <h2 className="text-lg font-semibold text-gray-800">
                                Información académica
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Información asociada a tu registro como candidato.
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            <FieldRow
                                label="Código"
                                name="codigo"
                                value={form.codigo}
                                readOnly
                                placeholder="Código asignado por el sistema"
                            />

                        </div>

                        <p className="mt-4 text-xs text-gray-400">
                            El código es asignado por el sistema y no puede
                            modificarse desde este formulario.
                        </p>

                    </section>


                    {/* INFORMACIÓN DEL PRACTICANTE */}

                    {esPracticante && (

                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">

                            <div className="mb-6">

                                <h2 className="text-lg font-semibold text-gray-800">
                                    Información de práctica
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Completa la información requerida para
                                    tu perfil como practicante.
                                </p>

                            </div>


                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                <FieldRow
                                    label="EPS"
                                    name="eps"
                                    value={form.eps}
                                    onChange={handleChange}
                                    disabled={!editando}
                                    placeholder="Ej: Sura, Sanitas, Nueva EPS"
                                    required
                                    error={errors.eps}
                                />

                                <FieldRow
                                    label="Fecha de nacimiento"
                                    name="fecha_nacimiento"
                                    type="date"
                                    value={form.fecha_nacimiento}
                                    onChange={handleChange}
                                    disabled={!editando}
                                    required
                                    error={errors.fecha_nacimiento}
                                />

                                <FieldRow
                                    label="Género"
                                    name="genero"
                                    value={form.genero}
                                    onChange={handleChange}
                                    disabled={!editando}
                                    options={generos}
                                    placeholder="Seleccione un género"
                                    required
                                    error={errors.genero}
                                />

                                <FieldRow
                                    label="Código departamento de residencia"
                                    name="codigoDepResidencia"
                                    value={form.codigoDepResidencia}
                                    onChange={handleChange}
                                    disabled={!editando}
                                    placeholder="Ej: 54"
                                    required
                                    error={errors.codigoDepResidencia}
                                />

                                <FieldRow
                                    label="Código municipio de residencia"
                                    name="codigoMunResidencia"
                                    value={form.codigoMunResidencia}
                                    onChange={handleChange}
                                    disabled={!editando}
                                    placeholder="Ej: 001"
                                    required
                                    error={errors.codigoMunResidencia}
                                />

                                <FieldLarge
                                    label="Dirección de residencia"
                                    name="direccion"
                                    value={form.direccion}
                                    onChange={handleChange}
                                    readOnly={!editando}
                                    placeholder="Ej: Calle 10 # 5-23, Barrio Centro"
                                    required
                                    error={errors.direccion}
                                />

                            </div>

                        </section>

                    )}


                    {/* BOTONES: solo visibles en modo edición */}

                    {editando && (

                        <div className="flex justify-end gap-3">

                            <button
                                type="button"
                                onClick={handleCancelarEdicion}
                                disabled={saving}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Guardando..."
                                    : "Guardar cambios"}
                            </button>

                        </div>

                    )}

                </form>

            </div>

        </Layout>
    );
}