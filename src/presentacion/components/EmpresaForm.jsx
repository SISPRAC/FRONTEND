import { useEffect, useRef, useState } from "react";

import toast from "react-hot-toast";

import bg from "../../assets/images/backgrounds/fondo.jpg";

const MAX_DESCRIPCION = 500;
const MAX_LOGO_MB = 2;
const TIPOS_LOGO = ["image/png", "image/jpeg"];

/**
 * "  cARlos   aNDRés " -> "Carlos Andrés"
 * Se exporta para reutilizarla en el submit (idealmente muévela a utils/).
 */
export const normalizarNombre = (valor = "") =>
  valor
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-CO")
    .replace(
      /(^|[\s'-])(\p{L})/gu,
      (_, sep, letra) => sep + letra.toLocaleUpperCase("es-CO")
    );

const formatearTamano = (bytes) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

const inputClass = (hasError, readOnly) =>
  `w-full rounded-xl px-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white border outline-none transition-all ${
    hasError
      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
      : readOnly
      ? "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
      : "border-gray-200 focus:ring-2 focus:ring-red-300 focus:border-red-300"
  }`;

function Field({ label, error, hint, children, className = "" }) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <label className="text-xs font-bold text-gray-700">{label}</label>
      {children}
      {hint && !error && <span className="text-[11px] text-gray-500">{hint}</span>}
      {error && <span className="text-[11px] text-red-600">{error}</span>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-600 border-b border-red-100 pb-1">
      {children}
    </h2>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

/* =========================================================
   MODAL DE PREVISUALIZACIÓN DEL LOGO
========================================================= */
function LogoModal({ file, url, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa del logo"
      >
        <h3 className="text-center text-lg font-extrabold text-gray-900">
          Vista previa del logo
        </h3>

        <div className="mt-4 flex h-56 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3">
          <img
            src={url}
            alt="Vista previa del logo"
            className="max-h-full max-w-full object-contain"
          />
        </div>

        <p className="mt-3 truncate text-center text-xs text-gray-500">
          {file.name} · {formatearTamano(file.size)}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-gray-300 py-2 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-red-600 py-2 text-sm font-extrabold text-white shadow transition-all hover:bg-red-700 active:scale-95"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmpresaForm({
  onSubmit,
  onChange,
  handleFileSelect,
  errors,
  loading = false,
  form,
}) {
  const fileInputRef = useRef(null);

  const [pendingLogo, setPendingLogo] = useState(null); // { file, url } en el modal
  const [logo, setLogo] = useState(null); // { file, url } ya confirmado

  // Helper para disparar onChange desde elementos que no son <input>
  const setValue = (name, value) => onChange({ target: { name, value } });

  // El tipo de documento arranca en CC
  useEffect(() => {
    if (!form.tipo_documento) setValue("tipo_documento", "CC");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Liberar las URLs temporales al desmontar
  useEffect(() => {
    return () => {
      if (pendingLogo?.url) URL.revokeObjectURL(pendingLogo.url);
      if (logo?.url) URL.revokeObjectURL(logo.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- LOGO ---------------- */

  const onLogoPicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    if (!TIPOS_LOGO.includes(file.type)) {
      toast.error("Solo se permiten imágenes PNG o JPG");
      return;
    }

    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      toast.error(`El logo no puede superar los ${MAX_LOGO_MB} MB`);
      return;
    }

    setPendingLogo({ file, url: URL.createObjectURL(file) });
  };

  const confirmarLogo = () => {
    if (logo?.url) URL.revokeObjectURL(logo.url);
    handleFileSelect(pendingLogo.file);
    setLogo(pendingLogo);
    setPendingLogo(null);
  };

  const cancelarLogo = () => {
    if (pendingLogo?.url) URL.revokeObjectURL(pendingLogo.url);
    setPendingLogo(null);
  };

  const quitarLogo = () => {
    if (logo?.url) URL.revokeObjectURL(logo.url);
    handleFileSelect(null);
    setLogo(null);
  };

  /* ---------------- NOMBRES ---------------- */

  const normalizarCampo = (name) =>
    setValue(name, normalizarNombre(form[name] || ""));

  const descripcion = form.descripcion_perfil || "";

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="min-h-screen w-full bg-white/50 backdrop-blur-[2px] flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-6xl bg-white/90 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-center">
            <h1 className="text-2xl font-extrabold text-white">
              Registro de Empresa
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-5 p-6">
            {/* =====================================================
                COLUMNA 1 · EMPRESA
            ===================================================== */}
            <section className="flex flex-col gap-3">
              <SectionTitle>Datos de la empresa</SectionTitle>

              <Field label="NIT" error={errors?.nit}>
                <input
                  name="nit"
                  type="text"
                  maxLength={20}
                  placeholder="Ingrese el NIT de la empresa"
                  onChange={onChange}
                  value={form.nit || ""}
                  className={inputClass(errors?.nit)}
                />
              </Field>

              <Field label="Empresa" error={errors?.nombre}>
                <input
                  name="nombre"
                  type="text"
                  maxLength={100}
                  placeholder="Ingrese el nombre de la empresa"
                  onChange={onChange}
                  value={form.nombre || ""}
                  className={inputClass(errors?.nombre)}
                />
              </Field>

              <Field label="Dirección" error={errors?.direccion}>
                <input
                  name="direccion"
                  type="text"
                  maxLength={150}
                  placeholder="Ingrese la dirección de la empresa"
                  onChange={onChange}
                  value={form.direccion || ""}
                  className={inputClass(errors?.direccion)}
                />
              </Field>

              <Field label="Teléfono" error={errors?.telefono}>
                <input
                  name="telefono"
                  type="text"
                  maxLength={10}
                  placeholder="Número de teléfono de contacto"
                  onChange={onChange}
                  value={form.telefono || ""}
                  className={inputClass(errors?.telefono)}
                />
              </Field>

              {/* Tipo de empresa: pública / privada */}
              <Field label="Tipo de empresa" error={errors?.es_publica}>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Pública", value: true },
                    { label: "Privada", value: false },
                  ].map(({ label, value }) => {
                    const activo = !!form.es_publica === value;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setValue("es_publica", value)}
                        className={`rounded-xl border py-2 text-sm font-semibold transition-all
                          ${
                            activo
                              ? "bg-red-600 border-red-600 text-white shadow"
                              : "bg-white border-gray-200 text-gray-600 hover:border-red-300"
                          }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </section>

            {/* =====================================================
                COLUMNA 2 · DIRECTOR Y ACCESO
            ===================================================== */}
            <section className="flex flex-col gap-3">
              <SectionTitle>Director y acceso</SectionTitle>

              <Field label="Nombres" error={errors?.nombres}>
                <input
                  type="text"
                  name="nombres"
                  placeholder="Nombres del director de la empresa"
                  onChange={onChange}
                  onBlur={() => normalizarCampo("nombres")}
                  value={form.nombres || ""}
                  className={inputClass(errors?.nombres)}
                />
              </Field>

              <Field label="Apellidos" error={errors?.apellidos}>
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Apellidos del director de la empresa"
                  onChange={onChange}
                  onBlur={() => normalizarCampo("apellidos")}
                  value={form.apellidos || ""}
                  className={inputClass(errors?.apellidos)}
                />
              </Field>

              <div className="grid grid-cols-[84px_1fr] gap-2">
                <Field label="Tipo">
                  <select
                    name="tipo_documento"
                    value={form.tipo_documento || "CC"}
                    onChange={onChange}
                    className={inputClass(errors?.tipo_documento)}
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PA">PA</option>
                    <option value="PEP">PEP</option>
                  </select>
                </Field>

                <Field
                  label="Documento"
                  error={errors?.cedula || errors?.tipo_documento}
                >
                  <input
                    name="cedula"
                    type="text"
                    maxLength={14}
                    placeholder="Ingrese su documento"
                    onChange={onChange}
                    value={form.cedula || ""}
                    className={inputClass(errors?.cedula)}
                  />
                </Field>
              </div>

              <Field
                label="Correo"
                error={errors?.correo}
                hint="Correo asignado mediante invitación"
              >
                <input
                  name="correo"
                  type="email"
                  readOnly
                  placeholder="Correo electrónico"
                  value={form.correo || ""}
                  className={inputClass(errors?.correo, true)}
                />
              </Field>

              <Field label="Contraseña" error={errors?.password}>
                <input
                  name="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  onChange={onChange}
                  value={form.password || ""}
                  className={inputClass(errors?.password)}
                />
              </Field>
            </section>

            {/* =====================================================
                COLUMNA 3 · LOGO, ÁREA Y REGISTRO
            ===================================================== */}
            <section className="flex flex-col gap-3">
              <SectionTitle>Logo y práctica</SectionTitle>

              <Field
                label="Logo"
                error={errors?.logo}
                hint="Solo PNG o JPG, máximo 2 MB"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={onLogoPicked}
                  className="hidden"
                />

                {logo ? (
                  <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-2">
                    <img
                      src={logo.url}
                      alt="Logo seleccionado"
                      className="h-14 w-14 rounded-lg border border-gray-100 object-contain bg-gray-50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-gray-700">
                        {logo.file.name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatearTamano(logo.file.size)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Cambiar
                      </button>
                      <button
                        type="button"
                        onClick={quitarLogo}
                        className="text-[11px] font-bold text-gray-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex h-20 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white text-sm transition-all hover:border-red-300 hover:text-red-600
                      ${
                        errors?.logo
                          ? "border-red-500 bg-red-50 text-red-600"
                          : "border-gray-300 text-gray-500"
                      }`}
                  >
                    <span className="font-semibold">Seleccionar logo</span>
                    <span className="text-[11px]">Haz clic para elegir una imagen</span>
                  </button>
                )}
              </Field>

              <Field
                label="Área que solicitan"
                error={errors?.descripcion_perfil}
              >
                <textarea
                  name="descripcion_perfil"
                  rows={4}
                  maxLength={MAX_DESCRIPCION}
                  placeholder="Escriba el área o perfil de practicante que busca. Ej: Full Stack, Analista de datos..."
                  onChange={onChange}
                  value={descripcion}
                  className={`${inputClass(errors?.descripcion_perfil)} resize-none`}
                />
                <span className="text-[11px] text-gray-400 text-right">
                  {descripcion.length}/{MAX_DESCRIPCION}
                </span>
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-full bg-red-600 py-2.5 px-10 font-extrabold text-white shadow-lg shadow-red-200 transition-all hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-red-600 disabled:active:scale-100"
              >
                {loading && <Spinner />}
                {loading ? "Registrando..." : "Registrar"}
              </button>
            </section>
          </div>
        </form>
      </div>

      {/* Modal de previsualización */}
      {pendingLogo && (
        <LogoModal
          file={pendingLogo.file}
          url={pendingLogo.url}
          onConfirm={confirmarLogo}
          onCancel={cancelarLogo}
        />
      )}
    </div>
  );
}