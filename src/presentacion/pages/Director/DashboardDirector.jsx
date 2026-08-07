import React, { useMemo, useState } from "react";
import {
  Building2, Users, XCircle, CheckCircle2, TrendingUp, TrendingDown, ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import Layout from "../../shared/Layouts/Layout";


// -----------------------------------------------------------------------
// Paleta: rojo (marca), negro (texto) y blanco (fondo), con acentos que
// no rompen la gama para diferenciar series en las gráficas.
// -----------------------------------------------------------------------
const COLOR_ROJO = "#EF4444";
const COLOR_NEGRO = "#111827";
const COLOR_AZUL = "#3B82F6";
const COLOR_VERDE = "#10B981";
const COLOR_AMBAR = "#F59E0B";
const COLOR_MORADO = "#8B5CF6";
const COLOR_TEAL = "#14B8A6";

// -----------------------------------------------------------------------
// DATOS DE EJEMPLO — reemplaza esto por lo que traigas de tu API,
// agregado por período. La forma de cada período es:
//   {
//     kpis: { empresas, practicantes, rechazados, aprobados } con { valor, cambio, tendencia }
//     satisfaccion: [{ mes, practicantes, empresas, docentes }]   // promedio de encuestas (0-100)
//     vacantesPorPerfil: [{ perfil, vacantes }]
//     resultadosSeleccion: [{ estado, valor }]                    // porcentaje
//   }
// -----------------------------------------------------------------------
const DATA_POR_PERIODO = {
  "2026-01": {
    kpis: {
      empresas: { valor: 40, cambio: 11.01, tendencia: "up" },
      practicantes: { valor: 60, cambio: -0.03, tendencia: "down" },
      rechazados: { valor: 4, cambio: 15.03, tendencia: "up" },
      aprobados: { valor: 56, cambio: 6.08, tendencia: "up" },
    },
    satisfaccion: [
      { mes: "Ene", practicantes: 72, empresas: 68, docentes: 80 },
      { mes: "Feb", practicantes: 65, empresas: 70, docentes: 78 },
      { mes: "Mar", practicantes: 74, empresas: 66, docentes: 82 },
      { mes: "Abr", practicantes: 80, empresas: 75, docentes: 79 },
      { mes: "May", practicantes: 78, empresas: 82, docentes: 85 },
      { mes: "Jun", practicantes: 83, empresas: 79, docentes: 88 },
      { mes: "Jul", practicantes: 85, empresas: 84, docentes: 86 },
    ],
    vacantesPorPerfil: [
      { perfil: "Frontend", vacantes: 18, color: COLOR_ROJO },
      { perfil: "Backend", vacantes: 30, color: COLOR_TEAL },
      { perfil: "UX/UI", vacantes: 12, color: COLOR_MORADO },
      { perfil: "QA", vacantes: 22, color: COLOR_AMBAR },
      { perfil: "Datos", vacantes: 9, color: COLOR_AZUL },
      { perfil: "Otro", vacantes: 15, color: COLOR_VERDE },
    ],
    resultadosSeleccion: [
      { estado: "Pendiente", valor: 52.1, color: COLOR_NEGRO },
      { estado: "Retirado", valor: 22.8, color: COLOR_AZUL },
      { estado: "Aceptado", valor: 13.9, color: COLOR_VERDE },
      { estado: "Rechazado", valor: 11.2, color: COLOR_ROJO },
    ],
  },
  "2025-02": {
    kpis: {
      empresas: { valor: 36, cambio: 4.4, tendencia: "up" },
      practicantes: { valor: 61, cambio: 2.1, tendencia: "up" },
      rechazados: { valor: 7, cambio: -8.5, tendencia: "down" },
      aprobados: { valor: 48, cambio: 3.2, tendencia: "up" },
    },
    satisfaccion: [
      { mes: "Ago", practicantes: 60, empresas: 62, docentes: 70 },
      { mes: "Sep", practicantes: 63, empresas: 65, docentes: 74 },
      { mes: "Oct", practicantes: 58, empresas: 60, docentes: 72 },
      { mes: "Nov", practicantes: 66, empresas: 68, docentes: 76 },
      { mes: "Dic", practicantes: 70, empresas: 71, docentes: 79 },
    ],
    vacantesPorPerfil: [
      { perfil: "Frontend", vacantes: 14, color: COLOR_ROJO },
      { perfil: "Backend", vacantes: 24, color: COLOR_TEAL },
      { perfil: "UX/UI", vacantes: 8, color: COLOR_MORADO },
      { perfil: "QA", vacantes: 17, color: COLOR_AMBAR },
      { perfil: "Datos", vacantes: 6, color: COLOR_AZUL },
      { perfil: "Otro", vacantes: 11, color: COLOR_VERDE },
    ],
    resultadosSeleccion: [
      { estado: "Pendiente", valor: 40.5, color: COLOR_NEGRO },
      { estado: "Retirado", valor: 18.2, color: COLOR_AZUL },
      { estado: "Aceptado", valor: 27.6, color: COLOR_VERDE },
      { estado: "Rechazado", valor: 13.7, color: COLOR_ROJO },
    ],
  },
};

function KpiCard({ icon, label, valor, cambio, tendencia, tint }) {
  const up = tendencia === "up";
  return (
    <div className={`rounded-2xl border border-gray-100 p-5 ${tint}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-500">{label}</span>
        {icon}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900">{valor}</span>
        <span className={`flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-600" : "text-red-500"}`}>
          {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(cambio)}%
        </span>
      </div>
    </div>
  );
}

export default function PracticasDashboard() {
  // TODO: reemplaza por tu fetch real agregado por período, por ejemplo:
  // const { data } = useQuery(["dashboard-practicas", periodo], () => fetchDashboard(periodo));
  const periodos = Object.keys(DATA_POR_PERIODO);
  const [periodo, setPeriodo] = useState(periodos[0]);

  const data = useMemo(() => DATA_POR_PERIODO[periodo], [periodo]);

  return (
    <Layout footerLabel="Director">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Practicas</h1>
          <div className="relative">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 outline-none focus:border-red-400"
            >
              {periodos.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Empresas"
            valor={data.kpis.empresas.valor}
            cambio={data.kpis.empresas.cambio}
            tendencia={data.kpis.empresas.tendencia}
            tint="bg-purple-50"
            icon={<Building2 size={18} className="text-purple-400" />}
          />
          <KpiCard
            label="Practicantes"
            valor={data.kpis.practicantes.valor}
            cambio={data.kpis.practicantes.cambio}
            tendencia={data.kpis.practicantes.tendencia}
            tint="bg-blue-50"
            icon={<Users size={18} className="text-blue-400" />}
          />
          <KpiCard
            label="Rechazados"
            valor={data.kpis.rechazados.valor}
            cambio={data.kpis.rechazados.cambio}
            tendencia={data.kpis.rechazados.tendencia}
            tint="bg-red-50"
            icon={<XCircle size={18} className="text-red-400" />}
          />
          <KpiCard
            label="Aprobados"
            valor={data.kpis.aprobados.valor}
            cambio={data.kpis.aprobados.cambio}
            tendencia={data.kpis.aprobados.tendencia}
            tint="bg-emerald-50"
            icon={<CheckCircle2 size={18} className="text-emerald-400" />}
          />
        </div>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-1">
            <h2 className="text-sm font-bold text-gray-900">Satisfacción promedio en encuestas</h2>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full" style={{ background: COLOR_ROJO }} /> Practicantes
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full" style={{ background: COLOR_NEGRO }} /> Empresas
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full" style={{ background: COLOR_AZUL }} /> Docentes
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.satisfaccion} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#F1F1F1" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #F1F1F1", fontSize: 12 }} />
                <Line type="monotone" dataKey="practicantes" stroke={COLOR_ROJO} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="empresas" stroke={COLOR_NEGRO} strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="docentes" stroke={COLOR_AZUL} strokeWidth={2.5} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-gray-900">Vacantes disponibles por perfil</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.vacantesPorPerfil} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="perfil" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #F1F1F1", fontSize: 12 }} />
                  <Bar dataKey="vacantes" radius={[6, 6, 0, 0]}>
                    {data.vacantesPorPerfil.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-sm font-bold text-gray-900">Distribución de resultados de selección</h2>
            <div className="flex items-center gap-6">
              <div className="h-48 w-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.resultadosSeleccion}
                      dataKey="valor"
                      nameKey="estado"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {data.resultadosSeleccion.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #F1F1F1", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {data.resultadosSeleccion.map((r) => (
                  <div key={r.estado} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-gray-500">{r.estado}</span>
                    <span className="ml-auto font-semibold text-gray-800">{r.valor}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
}