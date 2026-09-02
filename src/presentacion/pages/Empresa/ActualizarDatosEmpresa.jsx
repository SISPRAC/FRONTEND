import React, { useEffect, useRef, useState } from "react";
import Layout from "../../shared/Layouts/Layout";
import {
    Building2,
    MapPin,
    User,
    Phone,
    Mail,
    IdCard,
    BadgeCheck,
    Pencil,
    Save,
    X,
    Camera,
} from "lucide-react";

import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository.js";

import { obtenerEmpresa } from "../../../aplicacion/empresa/obtenerEmpresa.js";

import { actualizarEmpresa } from "../../../aplicacion/empresa/actualizarEmpresa.js";
import toast from "react-hot-toast";

const tiposDocumento = ["CC", "CE", "PEP", "PA"];

// Campo compacto
const FieldRow = ({
    icon: Icon,
    label,
    name,
    value,
    onChange,
    editable,
    type = "text",
}) => (
    <div className="flex flex-col gap-1">

        <label
            htmlFor={name}
            className="text-[11px] font-semibold text-slate-500 tracking-wide uppercase"
        >
            {label}
        </label>

        <div
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${editable
                    ? "border-red-200 bg-white ring-1 ring-red-100 focus-within:ring-2 focus-within:ring-red-400"
                    : "border-transparent bg-slate-100"
                }`}
        >

            <Icon
                size={15}
                className={
                    editable
                        ? "text-red-500 shrink-0"
                        : "text-slate-400 shrink-0"
                }
            />

            <input
                id={name}
                name={name}
                type={type}
                value={value ?? ""}
                onChange={onChange}
                disabled={!editable}
                placeholder={label}
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
            />

        </div>

    </div>
);

// Campo grande
const FieldLarge = ({
    icon: Icon,
    label,
    name,
    value,
    onChange,
    editable,
    type = "text",
    options,
}) => (
    <div className="flex flex-col gap-1.5">

        <label
            htmlFor={name}
            className="text-xs font-semibold text-slate-500 tracking-wide uppercase"
        >
            {label}
        </label>

        <div
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors ${editable
                    ? "border-red-200 bg-white ring-1 ring-red-100 focus-within:ring-2 focus-within:ring-red-400"
                    : "border-transparent bg-slate-100"
                }`}
        >

            <Icon
                size={19}
                className={
                    editable
                        ? "text-red-500 shrink-0"
                        : "text-slate-400 shrink-0"
                }
            />

            {options ? (

                <select
                    id={name}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    disabled={!editable}
                    className="w-full bg-transparent text-base text-slate-700 outline-none disabled:cursor-not-allowed"
                >

                    {options.map((opt) => (
                        <option key={opt} value={opt}>
                            {opt}
                        </option>
                    ))}

                </select>

            ) : (

                <input
                    id={name}
                    name={name}
                    type={type}
                    value={value ?? ""}
                    onChange={onChange}
                    disabled={!editable}
                    placeholder={label}
                    className="w-full bg-transparent text-base text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                />

            )}

        </div>

    </div>
);


const ActualizarEmpresa = () => {

    const [data, setData] = useState(null);

    const [draft, setDraft] = useState(null);

    const [editable, setEditable] = useState(false);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);


    // =====================================================
    // OBTENER EMPRESA
    // =====================================================

    useEffect(() => {

        const cargarEmpresa = async () => {

            try {

                setLoading(true);
                setError(null);

                const response = await obtenerEmpresa(
                    EmpresaRepository
                );



                const empresa = response.data;

                console.log("Datos empresa", empresa);

                const datos = {
                    // Empresa
                    id: empresa.id,
                    nit: empresa.nit || "",
                    nombre: empresa.nombre || "",
                    direccion: empresa.direccion || "",
                    logo: empresa.logo || null,
                    logoFile: null,

                    // Usuario
                    nombres: empresa.Usuario?.nombres || "",
                    apellidos: empresa.Usuario?.apellidos || "",
                    correo: empresa.Usuario?.correo || "",
                    tipo_documento:
                        empresa.Usuario?.tipo_documento || "CC",
                    cedula: empresa.Usuario?.cedula || "",
                    telefono: empresa.Usuario?.telefono || "",
                };

                setData(datos);
                setDraft(datos);

            } catch (error) {


                console.error(
                    "Error al cargar empresa:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "No fue posible cargar los datos de la empresa"
                );

            } finally {

                setLoading(false);

            }

        };

        cargarEmpresa();

    }, []);


    // =====================================================
    // CAMBIAR CAMPOS
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setDraft((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    // =====================================================
    // LOGO
    // =====================================================

    const handleLogoClick = () => {

        if (editable) {
            fileInputRef.current?.click();
        }

    };


    const handleLogoChange = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        // Guardar archivo real
        setDraft((prev) => ({
            ...prev,
            logoFile: file,
        }));

        // Preview
        const reader = new FileReader();

        reader.onload = () => {

            setDraft((prev) => ({
                ...prev,
                logo: reader.result,
            }));

        };

        reader.readAsDataURL(file);

    };


    // =====================================================
    // EDITAR
    // =====================================================

    const handleEditar = () => {

        setDraft({
            ...data,
            logoFile: null,
        });

        setEditable(true);

    };


    // =====================================================
    // CANCELAR
    // =====================================================

    const handleCancelar = () => {

        setDraft({
            ...data,
            logoFile: null,
        });

        setEditable(false);

    };


    // =====================================================
    // ACTUALIZAR
    // =====================================================

    const handleActualizar = async () => {

        try {

            setSaving(true);
            setError(null);

            const formData = new FormData();

            // Usuario
            formData.append("nombres", draft.nombres);
            formData.append("apellidos", draft.apellidos);
            formData.append("correo", draft.correo);
            formData.append("telefono", draft.telefono);
            formData.append("cedula", draft.cedula);
            formData.append("tipo_documento", draft.tipo_documento);

            // Empresa
            formData.append("nit", draft.nit);
            formData.append("nombre", draft.nombre);
            formData.append("direccion", draft.direccion);

            // Logo
            if (draft.logoFile) {
                formData.append("logo", draft.logoFile);
            }

            const response = await actualizarEmpresa(
                EmpresaRepository,
                draft.id,
                formData
            );

            const resultado = response.data;

            const nuevosDatos = {

                id: resultado.empresa.id,

                nit: resultado.empresa.nit || "",

                nombre: resultado.empresa.nombre || "",

                direccion: resultado.empresa.direccion || "",

                logo: resultado.empresa.logo || null,

                logoFile: null,

                nombres: resultado.user?.nombres || "",

                apellidos: resultado.user?.apellidos || "",

                correo: resultado.user?.correo || "",

                tipo_documento:
                    resultado.user?.tipo_documento || "CC",

                cedula: resultado.user?.cedula || "",

                telefono: resultado.user?.telefono || "",
            };

            setData(nuevosDatos);
            setDraft(nuevosDatos);
            setEditable(false);

            // Toast de éxito
            toast.success("Empresa actualizada correctamente");

        } catch (error) {

            console.error(
                "Error al actualizar empresa:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar la empresa"
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <Layout footerLabel="Empresa">

                <div className="flex h-full items-center justify-center">

                    <p className="text-sm text-slate-500">
                        Cargando información de la empresa...
                    </p>

                </div>

            </Layout>
        );

    }


    // =====================================================
    // ERROR / SIN DATOS
    // =====================================================

    if (error || !data) {

        return (
            <Layout footerLabel="Empresa">

                <div className="flex h-full items-center justify-center">

                    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">

                        <p className="text-sm font-medium text-red-600">
                            {error || "No se encontraron datos"}
                        </p>

                    </div>

                </div>

            </Layout>
        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <Layout footerLabel="Empresa">

            <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 py-3">

                {/* Encabezado */}

                <div className="mb-3">

                    <h1 className="text-xl font-bold text-slate-800">
                        Mi Empresa
                    </h1>

                    <p className="text-xs text-slate-500">
                        Datos de la empresa y del usuario responsable
                    </p>

                </div>


                {/* Contenido */}

                <div className="flex flex-1 flex-col gap-4 lg:flex-row">


                    {/* ================================================= */}
                    {/* EMPRESA */}
                    {/* ================================================= */}

                    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:w-72 lg:shrink-0">

                        <div className="flex flex-col items-center gap-2.5">

                            <div className="relative">

                                <div
                                    onClick={handleLogoClick}
                                    className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed ${editable
                                            ? "border-red-300 bg-red-50 cursor-pointer"
                                            : "border-slate-200 bg-slate-50"
                                        }`}
                                >

                                    {draft.logo ? (

                                        <img
                                            src={draft.logo}
                                            alt="Logo de la empresa"
                                            className="h-full w-full object-cover"
                                        />

                                    ) : (

                                        <Building2
                                            size={30}
                                            className="text-slate-300"
                                        />

                                    )}

                                </div>


                                {editable && (

                                    <button
                                        type="button"
                                        onClick={handleLogoClick}
                                        className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-red-500 text-white shadow-md transition-colors hover:bg-red-600"
                                        aria-label="Cambiar logo"
                                    >

                                        <Camera size={14} />

                                    </button>

                                )}

                            </div>


                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoChange}
                            />


                            <div className="text-center">

                                <p className="text-sm font-semibold text-slate-700">

                                    {draft.nombre ||
                                        "Nombre de la empresa"}

                                </p>

                                <p className="text-xs text-slate-400">

                                    {draft.nit ||
                                        "NIT no disponible"}

                                </p>

                            </div>

                        </div>


                        <div className="h-px w-full bg-slate-100" />


                        {/* Datos empresa */}

                        <div className="flex flex-col gap-3">

                            <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-700">

                                <Building2
                                    size={14}
                                    className="text-red-500"
                                />

                                Empresa

                            </h2>


                            <FieldRow
                                icon={IdCard}
                                label="NIT"
                                name="nit"
                                value={draft.nit}
                                onChange={handleChange}
                                editable={editable}
                            />


                            <FieldRow
                                icon={Building2}
                                label="Nombre"
                                name="nombre"
                                value={draft.nombre}
                                onChange={handleChange}
                                editable={editable}
                            />


                            <FieldRow
                                icon={MapPin}
                                label="Dirección"
                                name="direccion"
                                value={draft.direccion}
                                onChange={handleChange}
                                editable={editable}
                            />

                        </div>

                    </div>


                    {/* ================================================= */}
                    {/* USUARIO */}
                    {/* ================================================= */}

                    <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <h2 className="mb-4 mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">

                            <User
                                size={17}
                                className="text-red-500"
                            />

                            Usuario responsable

                        </h2>


                        <div className="grid mt-4 flex-1 grid-cols-1 gap-4 content-start sm:grid-cols-2">

                            <FieldLarge
                                icon={User}
                                label="Nombres"
                                name="nombres"
                                value={draft.nombres}
                                onChange={handleChange}
                                editable={editable}
                            />


                            <FieldLarge
                                icon={User}
                                label="Apellidos"
                                name="apellidos"
                                value={draft.apellidos}
                                onChange={handleChange}
                                editable={editable}
                            />


                            <FieldLarge
                                icon={BadgeCheck}
                                label="Tipo de documento"
                                name="tipo_documento"
                                value={draft.tipo_documento}
                                onChange={handleChange}
                                editable={editable}
                                options={tiposDocumento}
                            />


                            <FieldLarge
                                icon={IdCard}
                                label="Cédula"
                                name="cedula"
                                value={draft.cedula}
                                onChange={handleChange}
                                editable={editable}
                            />


                            <FieldLarge
                                icon={Mail}
                                label="Correo"
                                name="correo"
                                value={draft.correo}
                                onChange={handleChange}
                                editable={editable}
                                type="email"
                            />


                            <FieldLarge
                                icon={Phone}
                                label="Teléfono"
                                name="telefono"
                                value={draft.telefono}
                                onChange={handleChange}
                                editable={editable}
                            />

                        </div>


                        {/* Acciones */}

                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">

                            {!editable ? (

                                <button
                                    onClick={handleEditar}
                                    className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
                                >

                                    <Pencil size={15} />

                                    Editar

                                </button>

                            ) : (

                                <>

                                    <button
                                        onClick={handleCancelar}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                                    >

                                        <X size={15} />

                                        Cancelar

                                    </button>


                                    <button
                                        onClick={handleActualizar}
                                        disabled={saving}
                                        className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        <Save size={15} />

                                        {saving
                                            ? "Actualizando..."
                                            : "Actualizar"}

                                    </button>

                                </>

                            )}

                        </div>

                    </div>

                </div>

            </div>

        </Layout>

    );

};

export default ActualizarEmpresa;