import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FileSpreadsheet, FileDown } from "lucide-react";

import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";
import { periodoRepository } from "../../../infraestructura/repository/periodoRepository.js";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository.js";
import { grupoRepository } from "../../../infraestructura/repository/grupoRepository.js";

import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository.js";

import { obtenerEmpresasParaReportePorPeriodo } from "../../../aplicacion/empresa/obtenerEmpresasParaReportePorPeriodo.js";
import { obtenerCandidatosParaReportePorPeriodo } from "../../../aplicacion/candidato/obtenerCandidatosParaReportePorPeriodo.js";
import { obtenerGruposParaReportePorPeriodo } from "../../../aplicacion/grupos/obtenerGruposParaReportePorPeriodo.js";

import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos.js";
// ⚠️ Ajusta los "../" según dónde esté tu archivo
import logoSisprac from "../../../assets/images/logo/LogoReportes.png";

import GenericTable from "../../components/Table/GenericTable.jsx";
// ⚠️ Ajusta esta ruta a donde tengas EstadoBadge
import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";

import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ----------------------------- Helpers estado ----------------------------- */

const textoEstado = (valor) => {
  if (!valor) return "";
  const limpio = String(valor).replace(/_/g, " ").trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
};

// Un valor puede traer varios estados separados por coma (ej. convenios)
const separarEstados = (valor) =>
  String(valor ?? "")
    .split(",")
    .map((estado) => estado.trim())
    .filter(Boolean);

const renderEstado = (row) => {
  const estados = separarEstados(row.estado);

  if (!estados.length) return <EstadoBadge estado="Disponible" size="sm" />;

  return (
    <div className="flex flex-wrap justify-center gap-1">
      {estados.map((estado) => (
        <EstadoBadge key={estado} estado={estado} size="sm" />
      ))}
    </div>
  );
};

const exportEstado = (row) =>
  separarEstados(row.estado).map(textoEstado).join(", ");

const nombrePeriodoDeFila = (row) =>
  row.periodo ?? row.Periodo?.nombre ?? row.nombre ?? "Sin período";

const mensajeError = (error, porDefecto) =>
  error?.response?.data?.message || error?.message || porDefecto;

/* --------------------------------- Tabs ---------------------------------- */

const TABS = {
  practicas: {
    label: "Prácticas",
    columns: [
      {
        key: "periodo",
        label: "Período",
        primary: true,
        render: nombrePeriodoDeFila,
        exportValue: nombrePeriodoDeFila,
      },
      { key: "fecha_inicio", label: "Fecha de inicio" },
      { key: "fecha_fin", label: "Fecha de finalización" },
      {
        key: "estado",
        label: "Estado",
        render: renderEstado,
        exportValue: exportEstado,
      },
    ],
  },

  empresas: {
    label: "Empresas",
    columns: [
      { key: "nit", label: "NIT", primary: true },
      { key: "nombreEmpresa", label: "Empresa" },
      { key: "directorEmpresa", label: "Director empresa" },
      { key: "direccion", label: "Dirección" },
      { key: "telefono", label: "Teléfono" },
      { key: "correo", label: "Correo" },
      { key: "cantidadPracticantes", label: "Cantidad de practicantes" },
      {
        key: "estado",
        label: "Convenio",
        render: renderEstado,
        exportValue: exportEstado,
      },
    ],
  },

  practicantes: {
    label: "Practicantes",
    columns: [
      { key: "codigo", label: "Código", primary: true },
      { key: "nombreEstudiante", label: "Estudiante" },
      { key: "correo", label: "Correo" },
      { key: "grupo", label: "Grupo" },
      {
        key: "estado",
        label: "Estado",
        render: renderEstado,
        exportValue: exportEstado,
      },
      { key: "empresa", label: "Empresa" },
      { key: "vacante", label: "Vacante" },
    ],
  },

  grupos: {
    label: "Grupos",
    columns: [
      { key: "nombreGrupo", label: "Grupo", primary: true },
      { key: "tutorDocente", label: "Tutor docente" },
      { key: "cantidadPracticantes", label: "Cantidad" },
      {
        key: "estado",
        label: "Estado",
        render: renderEstado,
        exportValue: exportEstado,
      },
    ],
  },
};

/* ------------------------------ Menú descarga ----------------------------- */

const COLOR_PRIMARIO = [239, 68, 68];

// Convierte el logo importado a base64 y calcula su proporción
const cargarLogo = () =>
  new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      canvas.getContext("2d").drawImage(img, 0, 0);

      resolve({
        dataUrl: canvas.toDataURL("image/png"),
        ratio: img.naturalWidth / img.naturalHeight,
      });
    };

    img.onerror = () => resolve(null);
    img.src = logoSisprac;
  });

function DescargarMenu({
  rows,
  columns,
  fileName,
  titulo = "Reporte",
  periodo = "",
  disabled = false,
}) {
  // Para exportar se usa exportValue (texto plano), nunca el render (JSX)
  const formatCell = (row, col) => {
    const value = col.exportValue ? col.exportValue(row) : row[col.key];

    if (Array.isArray(value)) return value.join(", ");

    return value ?? "";
  };

  const toAoa = () => [
    columns.map((column) => column.label),
    ...rows.map((row) => columns.map((column) => formatCell(row, column))),
  ];

  const descargarXlsx = async () => {
    const logo = await cargarLogo();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Reporte", {
      views: [{ state: "frozen", ySplit: 6 }], // deja fijo el encabezado de la tabla
    });

    const rojo = "FFEF4444";
    const totalColumnas = columns.length;

    // Medidas
    const anchoColumna = 22; // caracteres (todas iguales)
    const altoFila = 24; // puntos
    const filasLogo = 4;
    const columnasLogo = 2; // el logo ocupa A y B

    // Conversión aproximada a píxeles
    const pxColumna = anchoColumna * 7 + 5;
    const pxFila = altoFila * (96 / 72);
    const cajaAncho = pxColumna * columnasLogo;
    const cajaAlto = pxFila * filasLogo;

    ws.columns = columns.map(() => ({ width: anchoColumna }));

    for (let fila = 1; fila <= filasLogo; fila++) {
      ws.getRow(fila).height = altoFila;
    }
    ws.getRow(5).height = 8; // espacio entre encabezado y tabla

    // Recuadro del logo combinado: A1 hasta B4
    ws.mergeCells(1, 1, filasLogo, columnasLogo);

    if (logo) {
      const margen = 10; // aire alrededor del logo
      const maxAncho = cajaAncho - margen * 2;
      const maxAlto = cajaAlto - margen * 2;

      // Se ajusta al recuadro manteniendo la proporción
      let alto = maxAlto;
      let ancho = alto * logo.ratio;

      if (ancho > maxAncho) {
        ancho = maxAncho;
        alto = ancho / logo.ratio;
      }

      const idLogo = wb.addImage({
        base64: logo.dataUrl.split(",")[1],
        extension: "png",
      });

      // Centrado dentro del recuadro
      // Centrado dentro del recuadro (posición exacta en EMU: 1 px = 9525 EMU)
      const EMU = 9525;

      const offsetX = (cajaAncho - ancho) / 2; // px desde el borde izquierdo de A
      const offsetY = (cajaAlto - alto) / 2; // px desde el borde superior de la fila 1

      const colInicio = Math.floor(offsetX / pxColumna);
      const filaInicio = Math.floor(offsetY / pxFila);

      ws.addImage(idLogo, {
        tl: {
          nativeCol: colInicio,
          nativeColOff: Math.round((offsetX - colInicio * pxColumna) * EMU),
          nativeRow: filaInicio,
          nativeRowOff: Math.round((offsetY - filaInicio * pxFila) * EMU),
        },
        ext: { width: ancho, height: alto },
      });
    }

    // Texto del encabezado: desde la columna C hasta la última, centrado
    const colTexto = columnasLogo + 1;

    const escribirTexto = (fila, valor, font) => {
      ws.mergeCells(fila, colTexto, fila, totalColumnas);

      const celda = ws.getCell(fila, colTexto);
      celda.value = valor;
      celda.font = font;
      celda.alignment = { vertical: "middle", horizontal: "center" };
    };

    escribirTexto(1, titulo, {
      bold: true,
      size: 18,
      color: { argb: "FF1F2937" },
    });

    escribirTexto(
      2,
      periodo ? `Período lectivo: ${periodo}` : "Todos los períodos",
      { bold: true, size: 12, color: { argb: rojo } }
    );

    escribirTexto(
      3,
      `Generado el ${new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })}`,
      { size: 10, color: { argb: "FF6B7280" } }
    );

    escribirTexto(4, `Total de registros: ${rows.length}`, {
      size: 10,
      color: { argb: "FF6B7280" },
    });

    ws.getCell(1, 1).alignment = { vertical: "middle", horizontal: "center" };

    // Línea roja debajo del encabezado
    for (let col = 1; col <= totalColumnas; col++) {
      ws.getCell(filasLogo, col).border = {
        bottom: { style: "medium", color: { argb: rojo } },
      };
    }

    // Fila 6: encabezados de la tabla
    const encabezado = ws.getRow(6);
    encabezado.values = columns.map((column) => column.label);
    encabezado.height = 26;

    encabezado.eachCell((celda) => {
      celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
      celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rojo } };
      celda.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Filas de datos
    const borde = { style: "thin", color: { argb: "FFE5E7EB" } };

    rows.forEach((row, i) => {
      const fila = ws.addRow(columns.map((column) => formatCell(row, column)));

      fila.eachCell((celda) => {
        celda.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };
        celda.border = { top: borde, bottom: borde, left: borde, right: borde };

        if (i % 2 === 1) {
          celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }
      });
    });

    // Descargar
    const buffer = await wb.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `${fileName}.xlsx`;
    enlace.click();
    URL.revokeObjectURL(url);
  };

  const descargarPdf = async () => {
    const logo = await cargarLogo();

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const margenX = 30;

    const fecha = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const dibujarEncabezado = () => {
      let textoX = margenX;

      if (logo) {
        const altoLogo = 45;
        const anchoLogo = altoLogo * logo.ratio;

        doc.addImage(logo.dataUrl, "PNG", margenX, 22, anchoLogo, altoLogo);
        textoX = margenX + anchoLogo + 14;
      }

      // Título: tipo de reporte (Empresas, Grupos, Practicantes, Prácticas)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text(titulo, textoX, 40);

      // Período en rojo y negrita
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...COLOR_PRIMARIO);
      doc.text(
        periodo ? `Período lectivo: ${periodo}` : "Todos los períodos",
        textoX,
        57
      );

      // Fecha y total a la derecha
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generado el ${fecha}`, anchoPagina - margenX, 40, {
        align: "right",
      });
      doc.text(
        `Total de registros: ${rows.length}`,
        anchoPagina - margenX,
        55,
        { align: "right" }
      );

      // Línea decorativa
      doc.setDrawColor(...COLOR_PRIMARIO);
      doc.setLineWidth(1.5);
      doc.line(margenX, 70, anchoPagina - margenX, 70);
    };

    autoTable(doc, {
      head: [columns.map((column) => column.label)],
      body: rows.map((row) =>
        columns.map((column) => formatCell(row, column))
      ),
      startY: 84,
      margin: { top: 84, left: margenX, right: margenX, bottom: 40 },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 5,
        textColor: [55, 65, 81],
        lineColor: [229, 231, 235],
        lineWidth: 0.5,
        valign: "middle",
      },
      headStyles: {
        fillColor: COLOR_PRIMARIO,
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },
      bodyStyles: { halign: "center" },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      didDrawPage: dibujarEncabezado,
    });

    // Pie de página con numeración (se hace al final para conocer el total)
    const totalPaginas = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);

      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(margenX, altoPagina - 28, anchoPagina - margenX, altoPagina - 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text("SISPRAC · Sistema de Prácticas", margenX, altoPagina - 14);
      doc.text(
        `Página ${i} de ${totalPaginas}`,
        anchoPagina - margenX,
        altoPagina - 14,
        { align: "right" }
      );
    }

    doc.save(`${fileName}.pdf`);
  };

  const botonClase = `
  group inline-flex items-center justify-center gap-2
  whitespace-nowrap rounded-full
  bg-red-500 px-6 py-2.5
  text-sm font-semibold text-white
  shadow-md shadow-red-500/20
  transition-all duration-200 ease-out
  hover:-translate-y-0.5 hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30
  active:translate-y-0 active:scale-95
  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2
  disabled:pointer-events-none disabled:opacity-50
`;

  return (
    <div className="flex flex-row items-center gap-3">
      <button onClick={descargarXlsx} disabled={disabled} className={botonClase}>
        <FileSpreadsheet
          size={18}
          className="shrink-0 transition-transform duration-200 group-hover:scale-110"
        />
        <span>XLSX</span>
      </button>

      <button onClick={descargarPdf} disabled={disabled} className={botonClase}>
        <FileDown
          size={18}
          className="shrink-0 transition-transform duration-200 group-hover:translate-y-0.5"
        />
        <span>PDF</span>
      </button>
    </div>
  );
}

/* --------------------------------- Página --------------------------------- */

export default function ReportesPage() {
  const [practicas, setPracticas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [practicantes, setPracticantes] = useState([]);
  const [grupos, setGrupos] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoPracticantes, setCargandoPracticantes] = useState(false);
  const [cargandoGrupos, setCargandoGrupos] = useState(false);

  const [activeTab, setActiveTab] = useState("practicas");
  const [currentPage, setCurrentPage] = useState(1);
  const [periodoId, setPeriodoId] = useState("");

  // Cargar prácticas y períodos (y seleccionar un período por defecto)
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);

        const [datosPracticas, datosPeriodos] = await Promise.all([
          getPracticas({ practicaRepository }),
          getPeriodos({ periodoRepository }),
        ]);

        const listaPeriodos = datosPeriodos || [];

        setPracticas(datosPracticas || []);
        setPeriodos(listaPeriodos);

        if (listaPeriodos.length) {
          const activo =
            listaPeriodos.find((p) =>
              ["activo", "activa", "en_curso", "en curso"].includes(
                String(p.estado ?? "").toLowerCase()
              )
            ) ?? listaPeriodos[0];

          setPeriodoId(String(activo.id));
        }
      } catch (error) {
        console.error("Error al cargar los reportes:", error);

        toast.error(
          mensajeError(error, "No se pudieron cargar los datos de los reportes.")
        );
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Cargar empresas según el período seleccionado
  useEffect(() => {
    let vigente = true;

    const cargarEmpresas = async () => {
      if (!periodoId) {
        setEmpresas([]);
        setCargandoEmpresas(false);
        return;
      }

      try {
        setCargandoEmpresas(true);

        const response = await obtenerEmpresasParaReportePorPeriodo(
          { empresaRepository: EmpresaRepository },
          periodoId
        );

        if (!vigente) return;

        const datosEmpresas = response?.data?.data ?? [];

        const empresasFormateadas = datosEmpresas.map((empresa) => {
          const convenios = empresa.Convenios ?? [];

          const estadosConvenio = [
            ...new Set(
              convenios.map((convenio) => convenio.estado).filter(Boolean)
            ),
          ];

          const candidatosAceptados = new Set();

          convenios.forEach((convenio) => {
            (convenio.Vacantes ?? []).forEach((vacante) => {
              (vacante.AperturaVacantes ?? []).forEach((apertura) => {
                (apertura.Postulacions ?? []).forEach((postulacion) => {
                  if (
                    postulacion.estado === "ACEPTADO" &&
                    postulacion.candidato_id
                  ) {
                    candidatosAceptados.add(postulacion.candidato_id);
                  }
                });
              });
            });
          });

          return {
            ...empresa,
            nombreEmpresa: empresa.nombre,

            directorEmpresa:
              [empresa.Usuario?.nombres, empresa.Usuario?.apellidos]
                .filter(Boolean)
                .join(" ") || "Sin información",

            telefono: empresa.Usuario?.telefono ?? "Sin información",
            correo: empresa.Usuario?.correo ?? "Sin información",

            estado: estadosConvenio.length
              ? estadosConvenio.join(", ")
              : "Sin convenio",

            cantidadPracticantes: candidatosAceptados.size,
          };
        });

        setEmpresas(empresasFormateadas);
      } catch (error) {
        if (!vigente) return;

        console.error("Error al cargar las empresas del período:", error);

        setEmpresas([]);

        toast.error(
          mensajeError(error, "No se pudieron cargar las empresas del período.")
        );
      } finally {
        if (vigente) setCargandoEmpresas(false);
      }
    };

    cargarEmpresas();

    return () => {
      vigente = false;
    };
  }, [periodoId]);

  // Cargar practicantes según el período seleccionado
  useEffect(() => {
    let vigente = true;

    const cargarPracticantes = async () => {
      if (!periodoId) {
        setPracticantes([]);
        setCargandoPracticantes(false);
        return;
      }

      try {
        setCargandoPracticantes(true);

        const datosPracticantes = await obtenerCandidatosParaReportePorPeriodo(
          { candidatoRepository },
          periodoId
        );

        if (!vigente) return;

        setPracticantes(
          Array.isArray(datosPracticantes) ? datosPracticantes : []
        );
      } catch (error) {
        if (!vigente) return;

        console.error("Error al cargar los practicantes del período:", error);

        setPracticantes([]);

        toast.error(
          mensajeError(
            error,
            "No se pudieron cargar los practicantes del período."
          )
        );
      } finally {
        if (vigente) setCargandoPracticantes(false);
      }
    };

    cargarPracticantes();

    return () => {
      vigente = false;
    };
  }, [periodoId]);

  // Cargar grupos según el período seleccionado
  useEffect(() => {
    let vigente = true;

    const cargarGrupos = async () => {
      if (!periodoId) {
        setGrupos([]);
        setCargandoGrupos(false);
        return;
      }

      try {
        setCargandoGrupos(true);

        const datosGrupos = await obtenerGruposParaReportePorPeriodo(
          { grupoRepository },
          periodoId
        );

        if (!vigente) return;

        if (!Array.isArray(datosGrupos)) {
          throw new Error("La respuesta de grupos no es un arreglo.");
        }

        const gruposFormateados = datosGrupos.map((grupo) => ({
          ...grupo,

          nombreGrupo: grupo.nombre ?? "Sin nombre",

          tutorDocente:
            [grupo.tutorDocente?.nombres, grupo.tutorDocente?.apellidos]
              .filter(Boolean)
              .join(" ") || "Sin tutor asignado",

          cantidadPracticantes: grupo.cantidadPracticantes ?? 0,

          estado: grupo.estado ?? "Sin información",
        }));

        setGrupos(gruposFormateados);
      } catch (error) {
        if (!vigente) return;

        console.error("Error al cargar los grupos del período:", error);

        setGrupos([]);

        toast.error(
          mensajeError(error, "No se pudieron cargar los grupos del período.")
        );
      } finally {
        if (vigente) setCargandoGrupos(false);
      }
    };

    cargarGrupos();

    return () => {
      vigente = false;
    };
  }, [periodoId]);

  const periodoActual = periodos.find(
    (periodo) => String(periodo.id) === periodoId
  );

  const activeRows = useMemo(() => {
    // Empresas, practicantes y grupos ya vienen filtrados desde el backend
    if (activeTab === "empresas") return empresas;
    if (activeTab === "practicantes") return practicantes;
    if (activeTab === "grupos") return grupos;

    // Prácticas se filtran aquí por el período seleccionado
    if (!periodoId) return practicas;

    return practicas.filter((row) => {
      const id = row.periodoId ?? row.periodo_id ?? row.Periodo?.id;

      if (id !== undefined && id !== null) {
        return String(id) === periodoId;
      }

      // Si la fila no trae id de período, se compara por nombre
      const nombre = row.periodo ?? row.Periodo?.nombre;

      return Boolean(nombre) && nombre === periodoActual?.nombre;
    });
  }, [
    activeTab,
    periodoId,
    periodoActual,
    practicas,
    empresas,
    practicantes,
    grupos,
  ]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const columns = TABS[activeTab].columns;

  const cargandoTabla =
    cargando ||
    (activeTab === "empresas" && cargandoEmpresas) ||
    (activeTab === "practicantes" && cargandoPracticantes) ||
    (activeTab === "grupos" && cargandoGrupos);

  // Mientras carga, no se muestran filas (ni paginación) de datos anteriores
  const filasTabla = cargandoTabla ? [] : activeRows;

  const emptyMessage = !periodoId
    ? `Selecciona un período para consultar ${TABS[
      activeTab
    ].label.toLowerCase()}.`
    : `No hay ${TABS[activeTab].label.toLowerCase()} registrados en este período.`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800">
            Período lectivo
          </span>

          <select
            value={periodoId}
            onChange={(e) => {
              setPeriodoId(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            {periodos.map((periodo) => (
              <option key={periodo.id} value={String(periodo.id)}>
                {periodo.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(TABS).map(([key, tab]) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`rounded-full px-6 py-2.5 text-sm font-bold transition-colors ${activeTab === key
              ? "bg-red-200 text-red-700"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <GenericTable
        rows={filasTabla}
        loading={cargandoTabla}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        columns={columns}
        emptyMessage={emptyMessage}
        pageSize={7}
      />

      <div className="mt-6 flex justify-end">
        <DescargarMenu
          rows={activeRows}
          columns={columns}
          titulo={`Reporte de ${TABS[activeTab].label}`}
          periodo={periodoActual?.nombre ?? ""}
          disabled={cargandoTabla || activeRows.length === 0}
          fileName={`reporte_${activeTab}_${periodoActual?.nombre ?? "periodo"
            }`.replace(/[^\w-]+/g, "_")}
        />
      </div>
    </div>
  );
}