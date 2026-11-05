import React, { useEffect, useState } from "react";
import {
  Building2, Briefcase, FileText, Percent, Users, ChevronDown,
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

// -----------------------------------------------------------------------
// Componentes auxiliares
// -----------------------------------------------------------------------
function KpiCard({ icon, label, valor, tint }) {
  return (
    <div className={`rounded-2xl border border-gray-100 p-5 ${tint}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">{label}</span>
        {icon}
      </div>
      <span className="text-3xl font-bold text-gray-900">{valor}</span>
    </div>
  );
}

function SinDatos({ texto = "Sin datos para este período" }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-gray-400">
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

// -----------------------------------------------------------------------
// Skeleton
// -----------------------------------------------------------------------
function Bloque({ className = "" }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200/70 ${className}`} />;
}

function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando reportes">
      {/* Tarjetas */}
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

      {/* Oferta y demanda */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
        <Bloque className="mb-2 h-4 w-48" />
        <Bloque className="mb-4 h-3 w-72" />
        <div className="flex h-72 items-end gap-4 pt-4">
          {[60, 85, 40, 70, 95, 50, 75].map((h, i) => (
            <div key={i} className="flex flex-1 items-end gap-1" style={{ height: "100%" }}>
              <Bloque className="w-full rounded-b-none" style={{ height: `${h}%` }} />
              <Bloque className="w-full rounded-b-none" style={{ height: `${Math.max(h - 20, 15)}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Gráficas inferiores */}
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

  // 1b. Cargar empresas para el filtro.
  // "todos" incluye empresas con convenio vencido, para consultar su histórico
  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const lista = await obtenerEmpresasParaSelect(
          { EmpresaRepository },
          "todos"
        );
        console.log("empresas recibidas:", lista); // quitar cuando funcione

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
  const empresaNombre =
    empresas.find((e) => String(e.id) === empresaId)?.nombre ?? "Todas las empresas";

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Encabezado + filtros */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Practicas</h1>
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

        {cargando ? (
          <DashboardSkeleton />
        ) : (
          <>
            {/* Tarjetas */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {empresaId ? (
                // Con una empresa seleccionada, "empresas" siempre sería 1,
                // así que mostramos cuántos cargos distintos tiene abiertos
                <KpiCard
                  label="Cargos con vacantes"
                  valor={ofertaDemanda.length}
                  tint="bg-purple-50"
                  icon={<Building2 size={18} className="text-purple-400" />}
                />
              ) : (
                <KpiCard
                  label="Empresas con vacantes"
                  valor={kpis.empresas}
                  tint="bg-purple-50"
                  icon={<Building2 size={18} className="text-purple-400" />}
                />
              )}
              <KpiCard
                label="Cupos disponibles"
                valor={kpis.cuposDisponibles}
                tint="bg-blue-50"
                icon={<Briefcase size={18} className="text-blue-400" />}
              />
              <KpiCard
                label="Postulaciones recibidas"
                valor={kpis.postulaciones}
                tint="bg-red-50"
                icon={<FileText size={18} className="text-red-400" />}
              />
              <KpiCard
                label="Tasa de aceptación"
                valor={`${kpis.tasaAceptacion}%`}
                tint="bg-emerald-50"
                icon={<Percent size={18} className="text-emerald-400" />}
              />
              <KpiCard
                label="Practicantes activos"
                valor={kpis.practicantesActivos}
                tint="bg-amber-50"
                icon={<Users size={18} className="text-amber-400" />}
              />
            </div>

            {/* Oferta y demanda por cargo */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
              <TituloGrafica
                titulo="Oferta y demanda por cargo"
                subtitulo="Cupos abiertos frente a postulaciones recibidas en cada cargo"
              />
              <div className="h-72">
                {ofertaDemanda.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ofertaDemanda} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#F1F1F1" />
                      <XAxis dataKey="cargo" tick={tickStyle} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={tickStyle} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="cupos" name="Cupos" fill={COLOR_AZUL} radius={[6, 6, 0, 0]} />
                      <Bar dataKey="postulaciones" name="Postulaciones" fill={COLOR_ROJO} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <SinDatos />
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Estado de los practicantes */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <TituloGrafica
                  titulo="Estado de los practicantes"
                  subtitulo="Practicantes del período según su estado actual, incluidos retirados y cancelados"
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
                    <SinDatos />
                  )}
                </div>
              </div>

              {/* Resultado de las postulaciones */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6">
                <TituloGrafica
                  titulo="Resultado de las postulaciones"
                  subtitulo="Porcentaje de postulaciones pendientes, aceptadas, rechazadas y retiradas"
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
                    <SinDatos />
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