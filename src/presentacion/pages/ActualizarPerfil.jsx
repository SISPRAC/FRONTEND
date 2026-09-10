import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../shared/Layouts/Layout";
import { userRepository } from "../../infraestructura/repository/userRepository";
import { actualizarPerfil } from "../../aplicacion/usuario/actualizarPerfil";
import { departamentoMunicipioRepository } from "../../infraestructura/repository/departamentoMunicipioRepository";


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
    "departamentoId",
    "municipioId",
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

                    {options.map((option) => {

                        const valueOption =
                            typeof option === "object"
                                ? option.value
                                : option;

                        const labelOption =
                            typeof option === "object"
                                ? option.label
                                : option;

                        return (
                            <option
                                key={valueOption}
                                value={valueOption}
                            >
                                {labelOption}
                            </option>
                        );

                    })}

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

    const [departamentos, setDepartamentos] = useState([]);
    const [municipios, setMunicipios] = useState([]);
    const [cargandoMunicipios, setCargandoMunicipios] = useState(false);

    // NUEVO: controla el modal de confirmación
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);


    useEffect(() => {

        const cargarPerfil = async () => {

            try {

                setLoading(true);

                // 1. CARGAR DEPARTAMENTOS
                const departamentosData =
                    await departamentoMunicipioRepository.getDepartamentos();

                setDepartamentos(departamentosData);

                // 2. CARGAR PERFIL
                const usuario = await userRepository.getMe();

                const candidato = usuario?.candidato;
                const practicante = candidato?.practicante;

                setEsPracticante(!!practicante);

                let departamentoId = "";
                let municipioId = "";
                let municipiosData = [];

                // 3. SI ES PRACTICANTE, BUSCAR LOS IDs
                //    A PARTIR DE LOS CÓDIGOS GUARDADOS
                if (practicante) {

                    const departamento =
                        departamentosData.find(
                            (departamento) =>
                                String(departamento.codigo) ===
                                String(practicante.codigoDepResidencia)
                        );

                    if (departamento) {

                        departamentoId = departamento.id;

                        // 4. CARGAR MUNICIPIOS DEL DEPARTAMENTO
                        municipiosData =
                            await departamentoMunicipioRepository
                                .getMunicipiosPorDepartamento(
                                    departamento.id
                                );

                        setMunicipios(municipiosData);

                        // 5. BUSCAR ID DEL MUNICIPIO
                        const municipio =
                            municipiosData.find(
                                (municipio) =>
                                    String(municipio.codigo) ===
                                    String(practicante.codigoMunResidencia)
                            );

                        if (municipio) {
                            municipioId = municipio.id;
                        }
                    }
                }

                const datosPerfil = {

                    nombres: usuario?.nombres || "",
                    apellidos: usuario?.apellidos || "",
                    correo: usuario?.correo || "",
                    tipo_documento: usuario?.tipo_documento || "",
                    cedula: usuario?.cedula || "",
                    telefono: usuario?.telefono || "",

                    codigo: candidato?.codigo || "",

                    eps: practicante?.eps || "",

                    departamentoId,

                    municipioId,

                    fecha_nacimiento:
                        practicante?.fecha_nacimiento || "",

                    genero:
                        practicante?.genero || "",

                    direccion:
                        practicante?.direccion || ""
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


    const handleChange = async (e) => {

        const { name, value } = e.target;

        let nuevoValor = value;

        // EPS siempre en MAYÚSCULAS
        if (name === "eps") {
            nuevoValor = value.toUpperCase();
        }

        // CAMBIO DE DEPARTAMENTO
        if (name === "departamentoId") {

            setForm((prev) => ({
                ...prev,
                departamentoId: value,
                municipioId: ""
            }));

            setMunicipios([]);

            setErrors((prev) => ({
                ...prev,
                departamentoId: false,
                municipioId: false
            }));

            if (!value) {
                return;
            }

            try {

                setCargandoMunicipios(true);

                const municipiosData =
                    await departamentoMunicipioRepository
                        .getMunicipiosPorDepartamento(value);

                setMunicipios(municipiosData);

            } catch (error) {

                console.error(
                    "Error cargando municipios:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "No se pudieron cargar los municipios"
                );

            } finally {

                setCargandoMunicipios(false);

            }

            return;
        }

        // CAMBIOS NORMALES
        setForm((prev) => ({
            ...prev,
            [name]: nuevoValor
        }));

        if (
            errors[name] &&
            nuevoValor.trim() !== ""
        ) {
            setErrors((prev) => ({
                ...prev,
                [name]: false
            }));
        }
    };


    const validarFormulario = () => {

        const camposRequeridos = [
            ...CAMPOS_OBLIGATORIOS_BASE,
            ...(esPracticante
                ? CAMPOS_OBLIGATORIOS_PRACTICANTE
                : [])
        ];

        const nuevosErrores = {};
        let hayErrores = false;

        camposRequeridos.forEach((campo) => {

            const valor = form[campo];

            if (
                !valor ||
                String(valor).trim() === ""
            ) {
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


    // AHORA SOLO VALIDA Y ABRE EL MODAL
    const handleSubmit = async (e) => {

        e.preventDefault();

        const esValido = validarFormulario();

        if (!esValido) {

            toast.error(
                "Completa los campos obligatorios marcados en rojo"
            );

            return;
        }

        setMostrarConfirmacion(true);
    };


    // CONFIRMACIÓN REAL DEL GUARDADO
    const confirmarGuardado = async () => {

        try {

            setSaving(true);
            setMostrarConfirmacion(false);

            await actualizarPerfil(
                { userRepository },
                form
            );

            toast.success(
                "Perfil actualizado correctamente"
            );

            setPerfilOriginal(form);
            setEditando(false);

            const rolActivo =
                localStorage.getItem("rolActivo");

            if (rolActivo === "Practicante") {

                navigate(
                    "/homePracticante",
                    { replace: true }
                );

            } else {

                navigate(
                    "/homeCandidato",
                    { replace: true }
                );

            }

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
                                    placeholder="Ej: SURA, SANITAS, NUEVA EPS"
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

                                {/* DEPARTAMENTO */}

                                <FieldRow
                                    label="Departamento de residencia"
                                    name="departamentoId"
                                    value={form.departamentoId}
                                    onChange={handleChange}
                                    disabled={!editando}
                                    options={departamentos.map(
                                        (departamento) => ({
                                            value: departamento.id,
                                            label: departamento.nombre
                                        })
                                    )}
                                    placeholder="Seleccione un departamento"
                                    required
                                    error={errors.departamentoId}
                                />

                                {/* MUNICIPIO */}

                                <FieldRow
                                    label="Municipio de residencia"
                                    name="municipioId"
                                    value={form.municipioId}
                                    onChange={handleChange}
                                    disabled={
                                        !editando ||
                                        !form.departamentoId ||
                                        cargandoMunicipios
                                    }
                                    options={municipios.map(
                                        (municipio) => ({
                                            value: municipio.id,
                                            label: municipio.nombre
                                        })
                                    )}
                                    placeholder={
                                        cargandoMunicipios
                                            ? "Cargando municipios..."
                                            : form.departamentoId
                                                ? "Seleccione un municipio"
                                                : "Seleccione primero un departamento"
                                    }
                                    required
                                    error={errors.municipioId}
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


                    {/* BOTONES */}

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


            {/* MODAL DE CONFIRMACIÓN */}

            {mostrarConfirmacion && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

                    <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

                        {/* ENCABEZADO */}

                        <div className="border-b border-gray-200 px-6 py-5">

                            <h2 className="text-xl font-bold text-gray-800">
                                Confirmar información
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                ¿Está seguro de que la información ingresada
                                es correcta?
                            </p>

                        </div>


                        {/* INFORMACIÓN */}

                        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        NOMBRES
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {form.nombres}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        APELLIDOS
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {form.apellidos}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        TIPO DE DOCUMENTO
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {form.tipo_documento}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        NÚMERO DE DOCUMENTO
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {form.cedula}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        TELÉFONO
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {form.telefono}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        CORREO
                                    </p>
                                    <p className="text-sm font-medium text-gray-700 break-all">
                                        {form.correo}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-gray-400">
                                        CÓDIGO
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {form.codigo}
                                    </p>
                                </div>


                                {esPracticante && (
                                    <>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400">
                                                EPS
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {form.eps}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-gray-400">
                                                FECHA DE NACIMIENTO
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {form.fecha_nacimiento}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-gray-400">
                                                GÉNERO
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {form.genero}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-gray-400">
                                                DEPARTAMENTO
                                            </p>

                                            <p className="text-sm font-medium text-gray-700">
                                                {
                                                    departamentos.find(
                                                        (departamento) =>
                                                            String(departamento.id) ===
                                                            String(form.departamentoId)
                                                    )?.nombre || "No seleccionado"
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-semibold text-gray-400">
                                                MUNICIPIO
                                            </p>

                                            <p className="text-sm font-medium text-gray-700">
                                                {
                                                    municipios.find(
                                                        (municipio) =>
                                                            String(municipio.id) ===
                                                            String(form.municipioId)
                                                    )?.nombre || "No seleccionado"
                                                }
                                            </p>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <p className="text-xs font-semibold text-gray-400">
                                                DIRECCIÓN
                                            </p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {form.direccion}
                                            </p>
                                        </div>
                                    </>
                                )}

                            </div>

                        </div>


                        {/* BOTONES */}

                        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

                            <button
                                type="button"
                                onClick={() =>
                                    setMostrarConfirmacion(false)
                                }
                                disabled={saving}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Revisar
                            </button>

                            <button
                                type="button"
                                onClick={confirmarGuardado}
                                disabled={saving}
                                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Guardando..."
                                    : "Sí, confirmar"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </Layout>
    );
}