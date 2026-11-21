import { useState } from "react";
import toast from "react-hot-toast";

import bg from "../../assets/images/backgrounds/fondo.jpg";
import {
  normalizarNombre,
  normalizarCargo,
} from "../components/utils/normalizarTexto";

const MIN_PASSWORD = 8;

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
      {hint && !error && (
        <span className="text-[11px] text-gray-500">{hint}</span>
      )}
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

function EyeIcon({ open }) {
  return open ? (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.94 10.94 0 0112 19c-6.5 0-10-7-10-7a18.5 18.5 0 015.06-5.94M9.9 4.24A10.9 10.9 0 0112 4c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19M1 1l22 22" />
      <path d="M14.12 14.12a3 3 0 11-4.24-4.24" />
    </svg>
  );
}

export default function StaffForm({
  onSubmit,
  onChange,
  errors,
  form,
  rol,
  loading = false,
}) {
  const esTutorDocente = rol === "Tutor Docente";
  const esTutorEmpresarial = rol === "Tutor Empresarial";

  const [verPassword, setVerPassword] = useState(false);
  const longitudPassword = (form.password || "").length;

  // Dispara onChange desde cualquier lugar (onBlur, etc.)
  const setValue = (name, value) => onChange({ target: { name, value } });

  const normalizarCampo = (name, fn) => setValue(name, fn(form[name] || ""));

  // Valida la contraseña antes de enviar
  const handleSubmit = (e) => {
    e.preventDefault();

    if (longitudPassword < MIN_PASSWORD) {
      toast.error(
        `La contraseña debe tener mínimo ${MIN_PASSWORD} caracteres`
      );
      return;
    }

    onSubmit(e);
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="min-h-screen w-full bg-white/50 backdrop-blur-[2px] flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white/90 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-center">
            <h1 className="text-2xl font-extrabold text-white">
              Registro {rol || "Tutor"}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 p-6">
            {/* =========================
                  DATOS PERSONALES
               ========================= */}
            <section className="flex flex-col gap-3">
              <SectionTitle>Datos personales</SectionTitle>

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
                    type="text"
                    name="cedula"
                    maxLength={14}
                    placeholder="Ingrese su documento"
                    onChange={onChange}
                    value={form.cedula || ""}
                    className={inputClass(errors?.cedula)}
                  />
                </Field>
              </div>

              <Field label="Nombres" error={errors?.nombres}>
                <input
                  type="text"
                  name="nombres"
                  placeholder="Ingrese sus nombres"
                  onChange={onChange}
                  onBlur={() => normalizarCampo("nombres", normalizarNombre)}
                  value={form.nombres || ""}
                  className={inputClass(errors?.nombres)}
                />
              </Field>

              <Field label="Apellidos" error={errors?.apellidos}>
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Ingrese sus apellidos"
                  onChange={onChange}
                  onBlur={() => normalizarCampo("apellidos", normalizarNombre)}
                  value={form.apellidos || ""}
                  className={inputClass(errors?.apellidos)}
                />
              </Field>

              <Field label="Teléfono" error={errors?.telefono}>
                <input
                  type="text"
                  name="telefono"
                  maxLength={10}
                  placeholder="Digite su teléfono"
                  onChange={onChange}
                  value={form.telefono || ""}
                  className={inputClass(errors?.telefono)}
                />
              </Field>
            </section>

            {/* =========================
                  CUENTA Y ROL
               ========================= */}
            <section className="flex flex-col gap-3">
              <SectionTitle>Cuenta y rol</SectionTitle>

              <Field
                label="Correo"
                error={errors?.email}
                hint="Correo asignado mediante invitación"
              >
                <input
                  type="email"
                  name="email"
                  readOnly
                  placeholder="Correo de la invitación"
                  value={form.email || ""}
                  className={inputClass(errors?.email, true)}
                />
              </Field>

              {esTutorDocente && (
                <Field label="Código del docente" error={errors?.codigo}>
                  <input
                    type="text"
                    name="codigo"
                    maxLength={10}
                    placeholder="Ingrese su código"
                    onChange={onChange}
                    value={form.codigo || ""}
                    className={inputClass(errors?.codigo)}
                  />
                </Field>
              )}

              {esTutorEmpresarial && (
                <Field
                  label="Cargo"
                  error={errors?.cargo}
                  hint="Ej: Ingeniero de Redes"
                >
                  <input
                    type="text"
                    name="cargo"
                    maxLength={100}
                    placeholder="Ingrese su cargo"
                    onChange={onChange}
                    onBlur={() => normalizarCampo("cargo", normalizarCargo)}
                    value={form.cargo || ""}
                    className={inputClass(errors?.cargo)}
                  />
                </Field>
              )}

              <Field
                label="Contraseña"
                error={errors?.password}
                hint={
                  longitudPassword > 0 && longitudPassword < MIN_PASSWORD
                    ? `Faltan ${MIN_PASSWORD - longitudPassword} caracteres (mínimo ${MIN_PASSWORD})`
                    : `Mínimo ${MIN_PASSWORD} caracteres`
                }
              >
                <div className="relative">
                  <input
                    type={verPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Cree una contraseña segura"
                    onChange={onChange}
                    value={form.password || ""}
                    className={`${inputClass(errors?.password)} pr-10`}
                  />

                  <button
                    type="button"
                    onClick={() => setVerPassword((v) => !v)}
                    aria-label={
                      verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    title={
                      verPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <EyeIcon open={verPassword} />
                  </button>
                </div>
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
    </div>
  );
}