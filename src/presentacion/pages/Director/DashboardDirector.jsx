import React, { useEffect, useState } from "react";
import {
  Building2, Briefcase, FileText, Percent, Users, ChevronDown, X,
  AlertTriangle, CheckCircle2, Inbox,
} from "lucide-react";
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { toast } from "react-hot-toast";

import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos.js";
import { periodoRepository } from "../../../infraestructura/repository/periodoRepository.js";
import { getDashboardReporte } from "../../../aplicacion/dashboard/getDashboardReporte.js";
import { reporteRepository } from "../../../infraestructura/repository/reporteRepository.js";

import { obtenerEmpresasParaSelect } from "../../../aplicacion/empresa/obtenerEmpresasParaSelect.js";
import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository.js";

// -----------------------------------------------------------------------
// Paleta
// -----------------------------------------------------------------------
const COLOR_ROJO = "#EF4444";
const COLOR_NEGRO = "#111827";
const COLOR_AZUL = "#3B82F6";
const COLOR_VERDE = "#10B981";
const COLOR_AMBAR = "#F59E0B";

const COLOR_RESULTADO = {
  Pendiente: COLOR_AMBAR,
  Aceptado: COLOR_VERDE,
  Rechazado: COLOR_ROJO,
};

const COLOR_PRACTICANTE = {
  "En curso": COLOR_AZUL,
  Finalizada: COLOR_VERDE,
  Retirado: COLOR_NEGRO,
  Cancelado: COLOR_AMBAR,
};

const DASHBOARD_VACIO = {
  kpis: {
    empresas: 0,
    cuposDisponibles: 0,
    postulaciones: 0,
    tasaAceptacion: 0,
    practicantesActivos: 0,
  },
  practicantesPorEstado: [],
  ofertaDemanda: [],
  // Una fila por vacante: { id, empresa, cargo, cupos, postulaciones }
  vacantes: [],
  // Ocupación: por empresa (global) o por cargo (empresa): { nombre, ocupados, libres }
  ocupacion: [],
  resultadosSeleccion: [],
};

const tooltipStyle = { borderRadius: 10, border: "1px solid #F1F1F1", fontSize: 12 };
const tickStyle = { fontSize: 12, fill: "#9CA3AF" };

const mensajeError = (error, porDefecto) =>
  error?.response?.data?.message || error?.message || porDefecto;

// El período activo es el que contiene la fecha de hoy; si no hay, el último
function elegirPeriodoActivo(lista) {
  const hoy = new Date().toISOString().slice(0, 10);
  return (
    lista.find((p) => p.fecha_inicio <= hoy && hoy <= p.fecha_fin) ??
    lista[lista.length - 1]
  );
}

// Estado de cada cargo según la relación cupos / postulaciones
function estadoCargo({ cupos = 0, postulaciones = 0 }) {
  if (postulaciones === 0) {
    return { texto: "Sin postulaciones", clase: "bg-gray-100 text-gray-600", icono: Inbox };
  }
  if (postulaciones > cupos) {
    return { texto: "Alta demanda", clase: "bg-red-50 text-red-600", icono: AlertTriangle };
  }
  return { texto: "Cupos suficientes", clase: "bg-emerald-50 text-emerald-600", icono: CheckCircle2 };
}

// -----------------------------------------------------------------------
// Componentes auxiliares
// -----------------------------------------------------------------------
function KpiCard({ icon, label, valor, tint, detalle }) {
  return (
    <div className={`rounded-2xl border border-gray-100 p-5 ${tint}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">{label}</span>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-900">{valor}</span>
      {detalle && <p className="mt-1 text-xs text-gray-400">{detalle}</p>}
    </div>
  );
}

function SinDatos({ texto = "Sin datos para este período" }) {
  return (
    <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
      {texto}
    </div>
  );
}

function TituloGrafica({ titulo, subtitulo }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold text-gray-900">{titulo}</h2>
      <p className="mt-0.5 text-xs text-gray-400">{subtitulo}</p>
    </div>
  );
}

// Select reutilizable (período y empresa)
function Selector({ value, onChange, disabled, children, ariaLabel }) {
  return (
    <div className="relative">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 outline-none focus:border-red-400 disabled:opacity-60"
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

// Banda que aparece solo cuando se filtra por una empresa
function BandaEmpresa({ empresa, periodoNombre, onLimpiar }) {
  const vencido = empresa?.convenioEstado === "vencido";
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
          <Building2 size={20} className="text-purple-500" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Viendo solo
          </p>
          <p className="text-base font-bold text-gray-900">
            {empresa?.nombre ?? "Empresa seleccionada"}
            {periodoNombre ? (
              <span className="ml-2 text-sm font-medium text-gray-400">· {periodoNombre}</span>
            ) : null}
          </p>
        </div>
        {empresa?.convenioEstado && (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              vencido ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {vencido ? "Convenio vencido" : "Convenio vigente"}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onLimpiar}
        className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
      >
        <X size={14} /> Ver todas las empresas
      </button>
    </div>
  );
}

// Tabla detallada de vacantes por cargo (vista de empresa)
function TablaVacantes({ filas, mostrarEmpresa }) {
  const totalCupos = filas.reduce((s, f) => s + (f.cupos ?? 0), 0);
  const totalPost = filas.reduce((s, f) => s + (f.postulaciones ?? 0), 0);

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
      <TituloGrafica
        titulo={mostrarEmpresa ? "Vacantes por empresa" : "Vacantes de la empresa"}
        subtitulo={
          mostrarEmpresa
            ? "Cada vacante con la empresa que la ofrece, sus cupos abiertos y las postulaciones recibidas"
            : "Detalle de cada cargo: cuántos cupos hay abiertos y cuántas personas se han postulado"
        }
      />
      {filas.length ? (
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-sm ${mostrarEmpresa ? "min-w-[680px]" : "min-w-[520px]"}`}>
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                {mostrarEmpresa && <th className="py-2 pr-4 font-semibold">Empresa</th>}
                <th className="py-2 pr-4 font-semibold">Cargo</th>
                <th className="py-2 pr-4 text-right font-semibold">Cupos</th>
                <th className="py-2 pr-4 text-right font-semibold">Postulaciones</th>
                <th className="py-2 pr-4 font-semibold">Postulaciones por cupo</th>
                <th className="py-2 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f, i) => {
                const est = estadoCargo(f);
                const Icono = est.icono;
                const ratio = f.cupos > 0 ? f.postulaciones / f.cupos : 0;
                const ancho = Math.min(ratio, 2) * 50; // 2x o más llena la barra
                return (
                  <tr key={f.id ?? `${f.empresa}-${f.cargo}-${i}`} className="border-b border-gray-50 last:border-0">
                    {mostrarEmpresa && (
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900">
                          <Building2 size={14} className="text-purple-400" />
                          {f.empresa ?? "—"}
                        </span>
                      </td>
                    )}
                    <td className="py-3 pr-4 font-medium text-gray-800">{f.cargo}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-blue-600">{f.cupos}</td>
                    <td className="py-3 pr-4 text-right font-semibold text-red-500">
                      {f.postulaciones}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${ancho}%`,
                              background: ratio > 1 ? COLOR_ROJO : COLOR_VERDE,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{ratio.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${est.clase}`}
                      >
                        <Icono size={12} /> {est.texto}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100 text-sm font-bold text-gray-900">
                {mostrarEmpresa && <td className="py-3 pr-4" />}
                <td className="py-3 pr-4">Total</td>
                <td className="py-3 pr-4 text-right">{totalCupos}</td>
                <td className="py-3 pr-4 text-right">{totalPost}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="h-32">
          <SinDatos texto="Esta empresa no tiene vacantes registradas en este período" />
        </div>
      )}
    </div>
  );
}

// Vacantes que necesitan atención (calculadas con los datos de `vacantes`)
function AlertasVacantes({ vacantes, mostrarEmpresa }) {
  const alertas = vacantes
    .filter((v) => v.cuposLibres > 0 && v.postulaciones < v.cupos)
    .map((v) => ({
      ...v,
      grave: v.postulaciones === 0,
      detalle:
        v.postulaciones === 0
          ? "Sin postulaciones"
          : `${v.postulaciones} postulación${v.postulaciones === 1 ? "" : "es"} para ${v.cupos} cupos`,
    }))
    .sort((a, b) => Number(b.grave) - Number(a.grave) || b.cuposLibres - a.cuposLibres);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <TituloGrafica
        titulo="Vacantes que necesitan atención"
        subtitulo="Cupos libres con pocas o ninguna postulación"
      />
      <div className="h-64 overflow-y-auto">
        {alertas.length ? (
          <ul className="space-y-2">
            {alertas.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {a.cargo}
                    {mostrarEmpresa && (
                      <span className="font-medium text-gray-400"> · {a.empresa}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">{a.detalle}</p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    a.grave ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                  }`}
                >
                  {a.cuposLibres} libre{a.cuposLibres === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <SinDatos texto="Todas las vacantes tienen postulaciones suficientes" />
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------
function Bloque({ className = "", style }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`} style={style} />;
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando reportes">
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <Bloque className="h-4 w-24" />
              <Bloque className="h-5 w-5 rounded-full" />
            </div>
            <Bloque className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Tabla de vacantes */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
        <Bloque className="mb-2 h-4 w-40" />
        <Bloque className="mb-5 h-3 w-80" />
        <div className="space-y-3">
          {/* Encabezado */}
          <div className="flex gap-4 border-b border-gray-100 pb-3">
            <Bloque className="h-3 w-1/4" />
            <Bloque className="h-3 w-1/4" />
            <Bloque className="h-3 w-16" />
            <Bloque className="h-3 w-20" />
            <Bloque className="h-3 flex-1" />
          </div>
          {/* Filas */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-1.5">
              <Bloque className="h-4 w-1/4" />
              <Bloque className="h-4 w-1/4" />
              <Bloque className="h-4 w-16" />
              <Bloque className="h-4 w-20" />
              <Bloque className="h-5 flex-1 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Ocupación de cupos + alertas */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <Bloque className="mb-2 h-4 w-40" />
          <Bloque className="mb-4 h-3 w-64" />
          <div className="flex h-64 items-end gap-6 px-4">
            {[75, 55, 90, 40].map((h, i) => (
              <div key={i} className="flex w-full flex-col justify-end gap-0.5" style={{ height: "100%" }}>
                <Bloque className="w-full rounded-b-none" style={{ height: `${Math.round(h * 0.4)}%` }} />
                <Bloque className="w-full rounded-b-none" style={{ height: `${Math.round(h * 0.6)}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <Bloque className="mb-2 h-4 w-52" />
          <Bloque className="mb-4 h-3 w-56" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
              >
                <div className="flex-1 space-y-1.5">
                  <Bloque className="h-4 w-2/3" />
                  <Bloque className="h-3 w-1/3" />
                </div>
                <Bloque className="h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <Bloque className="mb-2 h-4 w-44" />
          <Bloque className="mb-4 h-3 w-64" />
          <div className="flex h-64 items-end gap-6 px-4">
            {[70, 45, 30, 55].map((h, i) => (
              <Bloque key={i} className="w-full rounded-b-none" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <Bloque className="mb-2 h-4 w-52" />
          <Bloque className="mb-4 h-3 w-60" />
          <div className="flex items-center gap-6">
            <div className="flex h-48 w-48 flex-shrink-0 items-center justify-center">
              <div className="h-40 w-40 animate-pulse rounded-full border-[22px] border-gray-200/70" />
            </div>
            <div className="flex-1 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Bloque key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// Componente principal
// -----------------------------------------------------------------------
export default function PracticasDashboard() {
  const [periodos, setPeriodos] = useState([]);
  const [periodoId, setPeriodoId] = useState("");

  // Filtro por empresa: "" = todas (vista global)
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");

  const [dashboard, setDashboard] = useState(DASHBOARD_VACIO);
  const [cargandoPeriodos, setCargandoPeriodos] = useState(true);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // 1. Cargar períodos y elegir el activo
  useEffect(() => {
    const cargarPeriodos = async () => {
      try {
        setCargandoPeriodos(true);
        const datosPeriodos = await getPeriodos({ periodoRepository });
        const lista = datosPeriodos || [];
        setPeriodos(lista);
        if (lista.length) {
          setPeriodoId(String(elegirPeriodoActivo(lista).id));
        }
      } catch (error) {
        console.error("Error al cargar los períodos:", error);
        toast.error(mensajeError(error, "No se pudieron cargar los períodos."));
      } finally {
        setCargandoPeriodos(false);
      }
    };
    cargarPeriodos();
  }, []);

  // 1b. Cargar empresas para el filtro ("todos" incluye convenios vencidos)
  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const lista = await obtenerEmpresasParaSelect({ EmpresaRepository }, "todos");
        // Acepta el arreglo directo o la respuesta { success, data }
        const arreglo = Array.isArray(lista) ? lista : lista?.data;
        setEmpresas(Array.isArray(arreglo) ? arreglo : []);
      } catch (error) {
        console.error("Error al cargar las empresas:", error);
        toast.error(mensajeError(error, "No se pudieron cargar las empresas."));
      }
    };
    cargarEmpresas();
  }, []);

  // 2. Cargar el dashboard cuando cambia el período o la empresa
  useEffect(() => {
    if (!periodoId) return;

    let cancelado = false;

    const cargarDashboard = async () => {
      try {
        setCargandoDatos(true);

        // empresaId vacío => undefined => el backend devuelve todo global
        const data = await getDashboardReporte(
          { reporteRepository },
          periodoId,
          empresaId || undefined
        );

        if (!cancelado) {
          setDashboard({
            ...DASHBOARD_VACIO,
            ...data,
            kpis: { ...DASHBOARD_VACIO.kpis, ...data?.kpis },
          });
        }
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
        if (!cancelado) {
          setDashboard(DASHBOARD_VACIO);
          toast.error(
            mensajeError(error, "No se pudieron cargar los datos de los reportes.")
          );
        }
      } finally {
        if (!cancelado) setCargandoDatos(false);
      }
    };

    cargarDashboard();

    // Evita que una respuesta vieja pise a una más reciente
    return () => {
      cancelado = true;
    };
  }, [periodoId, empresaId]);

  const { kpis, ofertaDemanda } = dashboard;
  const porEmpresa = Boolean(empresaId);

  // Los colores se asignan aquí; el backend solo manda los datos
  const practicantesPorEstado = dashboard.practicantesPorEstado.map((p) => ({
    ...p,
    color: COLOR_PRACTICANTE[p.estado] ?? COLOR_NEGRO,
  }));

  const resultadosSeleccion = dashboard.resultadosSeleccion.map((r) => ({
    ...r,
    color: COLOR_RESULTADO[r.estado] ?? COLOR_NEGRO,
  }));

  const hayPracticantes = practicantesPorEstado.some((p) => p.total > 0);
  const hayResultados = resultadosSeleccion.some((r) => r.valor > 0);
  const cargando = cargandoPeriodos || cargandoDatos;

  const periodoNombre = periodos.find((p) => String(p.id) === periodoId)?.nombre;
  const empresaSeleccionada = empresas.find((e) => String(e.id) === empresaId);
  const empresaNombre = empresaSeleccionada?.nombre ?? "Todas las empresas";

  // Textos que cambian según la vista, para que siempre sea claro qué se está viendo
  const alcance = porEmpresa ? "de esta empresa" : "de todas las empresas";

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Encabezado + filtros */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prácticas</h1>
            <p className="mt-0.5 text-xs text-gray-400">
              {empresaNombre}
              {periodoNombre ? ` · ${periodoNombre}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Selector
              ariaLabel="Filtrar por empresa"
              value={empresaId}
              onChange={(e) => setEmpresaId(e.target.value)}
              disabled={cargandoPeriodos || !empresas.length}
            >
              <option value="">Todas las empresas</option>
              {empresas.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.nombre}
                  {e.convenioEstado === "vencido" ? " (convenio vencido)" : ""}
                </option>
              ))}
            </Selector>

            <Selector
              ariaLabel="Filtrar por período"
              value={periodoId}
              onChange={(e) => setPeriodoId(e.target.value)}
              disabled={cargandoPeriodos || !periodos.length}
            >
              {periodos.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.nombre}
                </option>
              ))}
            </Selector>
          </div>
        </div>

        {/* Banda de contexto: solo con una empresa seleccionada */}
        {porEmpresa && (
          <BandaEmpresa
            empresa={empresaSeleccionada}
            periodoNombre={periodoNombre}
            onLimpiar={() => setEmpresaId("")}
          />
        )}

        {cargando ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Tarjetas */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {porEmpresa ? (
                <KpiCard
                  label="Cargos con vacantes"
                  valor={ofertaDemanda.length}
                  detalle="Cargos distintos abiertos"
                  tint="bg-purple-50"
                  icon={<Building2 size={18} className="text-purple-400" />}
                />
              ) : (
                <KpiCard
                  label="Empresas con vacantes"
                  valor={kpis.empresas}
                  detalle="Con al menos un cupo abierto"
                  tint="bg-purple-50"
                  icon={<Building2 size={18} className="text-purple-400" />}
                />
              )}
              <KpiCard
                label="Cupos disponibles"
                valor={kpis.cuposDisponibles}
                detalle={`Vacantes abiertas ${alcance}`}
                tint="bg-blue-50"
                icon={<Briefcase size={18} className="text-blue-400" />}
              />
              <KpiCard
                label="Postulaciones recibidas"
                valor={kpis.postulaciones}
                detalle={`Total ${alcance}`}
                tint="bg-red-50"
                icon={<FileText size={18} className="text-red-400" />}
              />
              <KpiCard
                label="Tasa de aceptación"
                valor={`${kpis.tasaAceptacion}%`}
                detalle="Aceptadas sobre el total"
                tint="bg-emerald-50"
                icon={<Percent size={18} className="text-emerald-400" />}
              />
              <KpiCard
                label="Practicantes activos"
                valor={kpis.practicantesActivos}
                detalle="Actualmente en curso"
                tint="bg-amber-50"
                icon={<Users size={18} className="text-amber-400" />}
              />
            </div>

            {/* Detalle de vacantes. En la vista global muestra de qué empresa es cada una.
                Si el backend aún no manda `vacantes`, usa ofertaDemanda (sin empresa). */}
            <TablaVacantes
              filas={dashboard.vacantes.length ? dashboard.vacantes : ofertaDemanda}
              mostrarEmpresa={!porEmpresa && dashboard.vacantes.length > 0}
            />

            {/* Ocupación de cupos + alertas */}
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <TituloGrafica
                  titulo="Ocupación de cupos"
                  subtitulo={
                    porEmpresa
                      ? "Cupos ocupados (postulaciones aceptadas) y libres en cada cargo de esta empresa"
                      : "Cupos ocupados (postulaciones aceptadas) y libres en cada empresa"
                  }
                />
                <div className="h-64">
                  {dashboard.ocupacion.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboard.ocupacion}
                        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid vertical={false} stroke="#F1F1F1" />
                        <XAxis dataKey="nombre" tick={tickStyle} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="ocupados" name="Ocupados" stackId="cupos" fill={COLOR_VERDE} />
                        <Bar
                          dataKey="libres"
                          name="Libres"
                          stackId="cupos"
                          fill={COLOR_AZUL}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <SinDatos
                      texto={
                        porEmpresa
                          ? "Esta empresa no tiene cupos en este período"
                          : "Sin datos para este período"
                      }
                    />
                  )}
                </div>
              </div>

              <AlertasVacantes vacantes={dashboard.vacantes} mostrarEmpresa={!porEmpresa} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Estado de los practicantes */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <TituloGrafica
                  titulo="Estado de los practicantes"
                  subtitulo={
                    porEmpresa
                      ? "Practicantes de esta empresa en el período, incluidos retirados y cancelados"
                      : "Practicantes del período según su estado actual, incluidos retirados y cancelados"
                  }
                />
                <div className="h-64">
                  {hayPracticantes ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={practicantesPorEstado} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} stroke="#F1F1F1" />
                        <XAxis dataKey="estado" tick={tickStyle} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="total" name="Practicantes" radius={[6, 6, 0, 0]}>
                          {practicantesPorEstado.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <SinDatos
                      texto={
                        porEmpresa
                          ? "Esta empresa no tiene practicantes en este período"
                          : "Sin datos para este período"
                      }
                    />
                  )}
                </div>
              </div>

              {/* Resultado de las postulaciones */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <TituloGrafica
                  titulo="Resultado de las postulaciones"
                  subtitulo={
                    porEmpresa
                      ? "Porcentaje de postulaciones a esta empresa según su resultado"
                      : "Porcentaje de postulaciones pendientes, aceptadas, rechazadas y retiradas"
                  }
                />
                {hayResultados ? (
                  <div className="flex items-center gap-6">
                    <div className="h-48 w-48 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={resultadosSeleccion}
                            dataKey="valor"
                            nameKey="estado"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={2}
                          >
                            {resultadosSeleccion.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2.5">
                      {resultadosSeleccion.map((r) => (
                        <div key={r.estado} className="flex items-center gap-2 text-sm">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                          <span className="text-gray-500">{r.estado}</span>
                          <span className="ml-auto font-semibold text-gray-800">{r.valor}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48">
                    <SinDatos
                      texto={
                        porEmpresa
                          ? "Esta empresa aún no tiene postulaciones en este período"
                          : "Sin datos para este período"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}