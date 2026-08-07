import React, { useMemo, useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable"; 
import Layout from "../../shared/Layouts/Layout";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// -----------------------------------------------------------------------
// Configuración de columnas por pestaña. Cada `key` debe coincidir con
// el campo que traiga tu fila desde la base de datos.
// -----------------------------------------------------------------------
const TABS = {
  empresas: {
    label: "Empresas",
    columns: [
      { key: "nit", label: "NIT", primary: true },
      { key: "nombreEmpresa", label: "Empresa" },
      { key: "directorEmpresa", label: "Director empresa" },
      { key: "tutorEmpresa", label: "Tutor empresa" },
      { key: "direccion", label: "Dirección" },
      { key: "telefono", label: "Teléfono" },
      { key: "correo", label: "Correo" },
      { key: "estado", label: "Estado" },
    ],
  },
  practicantes: {
    label: "Practicantes",
    columns: [
      { key: "nombre", label: "Nombre", primary: true },
      { key: "grupo", label: "Grupo" },
      { key: "estado", label: "Estado" },
      { key: "empresa", label: "Empresa" },
      { key: "tutorEmpresarial", label: "Tutor empresarial" },
    ],
  },
  grupos: {
    label: "Grupos",
    columns: [
      { key: "nombreGrupo", label: "Grupo", primary: true },
      { key: "tutorDocente", label: "Tutor docente" },
      { key: "cantidadPracticantes", label: "Cantidad" },
      { key: "estado", label: "Estado" },
      { key: "candidatos", label: "Candidatos" },
    ],
  },
};

// -----------------------------------------------------------------------
// Menú de descarga: exporta la pestaña activa (columnas + filas visibles).
// -----------------------------------------------------------------------
function DescargarMenu({ rows, columns, fileName }) {
  const [open, setOpen] = useState(false);

  const formatCell = (row, col) => {
    const val = row[col.key];
    return Array.isArray(val) ? val.join(", ") : val ?? "";
  };

  const toAoa = () => [
    columns.map((c) => c.label),
    ...rows.map((r) => columns.map((c) => formatCell(r, c))),
  ];

  const descargarXlsx = () => {
    const ws = XLSX.utils.aoa_to_sheet(toAoa());
    ws["!cols"] = columns.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    setOpen(false);
  };

  const descargarPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Reportes", 40, 40);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generado el ${new Date().toLocaleDateString("es-CO")}`, 40, 56);

    autoTable(doc, {
      head: [columns.map((c) => c.label)],
      body: rows.map((r) => columns.map((c) => formatCell(r, c))),
      startY: 72,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 251] },
      margin: { left: 30, right: 30 },
    });

    doc.save(`${fileName}.pdf`);
    setOpen(false);
  };

  return (
    <div className="relative flex gap-3">
      <button
        onClick={descargarXlsx}
        className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
      >
        XLSX
      </button>
      <button
        onClick={descargarPdf}
        className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
      >
        PDF
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------
// Página principal de Reportes.
//
// `periodos`, `empresas`, `practicantes` y `grupos` deben venir de tu
// base de datos / API. Cada fila necesita un campo `periodoId` para que
// el filtro por período lectivo funcione.
//
// Formas esperadas:
//   periodos:     [{ id, label }]
//   empresas:     [{ nit, nombreEmpresa, directorEmpresa, tutorEmpresa,
//                     direccion, telefono, correo, estado, periodoId }]
//   practicantes: [{ nombre, grupo, estado, empresa, tutorEmpresarial, periodoId }]
//   grupos:       [{ nombreGrupo, tutorDocente, cantidadPracticantes,
//                     estado, candidatos: string[], periodoId }]
// -----------------------------------------------------------------------
export default function ReportesPage({
  periodos = [],
  empresas = [],
  practicantes = [],
  grupos = [],
}) {
  // TODO: reemplaza por tu fetch real, por ejemplo con react-query:
  // const { data: periodos } = useQuery(["periodos"], fetchPeriodos);
  // const { data: empresas } = useQuery(["empresas", periodoId], () => fetchEmpresas(periodoId));
  // const { data: practicantes } = useQuery(["practicantes", periodoId], () => fetchPracticantes(periodoId));
  // const { data: grupos } = useQuery(["grupos", periodoId], () => fetchGrupos(periodoId));

  const [activeTab, setActiveTab] = useState("practicantes");
  const [currentPage, setCurrentPage] = useState(1);
  const [periodoId, setPeriodoId] = useState(periodos[0]?.id ?? null);

  const periodoActual = periodos.find((p) => p.id === periodoId);

  const datasets = { empresas, practicantes, grupos };
  const activeRows = useMemo(() => {
    const rows = datasets[activeTab] || [];
    if (!periodoId) return rows;
    return rows.filter((r) => r.periodoId === periodoId);
  }, [activeTab, periodoId, empresas, practicantes, grupos]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  return (
    <Layout footerLabel="Director">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">Periodo Lectivo</span>
            <div className="relative">
              <select
                value={periodoId ?? ""}
                onChange={(e) => setPeriodoId(e.target.value)}
                className="appearance-none rounded-full border border-red-300 bg-white py-1.5 pl-4 pr-9 text-sm font-medium text-gray-700 outline-none focus:border-red-400"
              >
                {periodos.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-red-500" />
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          {Object.entries(TABS).map(([key, tab]) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`rounded-full px-8 py-2.5 text-sm font-bold transition-colors ${
                activeTab === key
                  ? "bg-red-200 text-red-700"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <GenericTable
          rows={activeRows}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={TABS[activeTab].columns.map((c) =>
            c.key === "candidatos"
              ? { ...c, render: (row) => (row.candidatos || []).join(", ") }
              : c
          )}
          emptyMessage={`No hay ${TABS[activeTab].label.toLowerCase()} registrados en este período.`}
          pageSize={7}
        />

        <div className="mt-6 flex justify-end">
          <DescargarMenu
            rows={activeRows}
            columns={TABS[activeTab].columns}
            fileName={`reporte_${activeTab}_${periodoActual?.label ?? ""}`}
          />
        </div>
      </div>
    </Layout >
  );
}