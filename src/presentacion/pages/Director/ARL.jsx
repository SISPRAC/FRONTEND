import React, { useState, useEffect } from "react";
import {
    Download,
    FileSpreadsheet,
    FileText,
    Clock,
    CheckCircle2,
    CalendarDays,
    CalendarCheck,
    Users,
    ChevronDown,
    Loader2
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";

import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { practicanteRepository } from "../../../infraestructura/repository/practicanteRepository.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { obtenerPracticantesPorPractica } from "../../../aplicacion/practicante/obtenerPracticantesPorPractica.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";

import logoSisprac from "../../../assets/images/logo/LogoReportes.png";
import logoSispracPDF from "../../../assets/images/logo/solo_logo.png";
import logoPrograma from "../../../assets/images/logo/Programa_Ingeniería_de_Sistemas.png";

import toast from "react-hot-toast";


// -----------------------------------------------------------------------
// Configuración de columnas (se usa en la tabla, el Excel y el PDF)
// -----------------------------------------------------------------------

const COLUMNS = [
    { key: "numDoc", label: "Cédula", primary: true },
    { key: "tipoDoc", label: "Tipo de documento" },
    { key: "nombres", label: "Nombres" },
    { key: "apellidos", label: "Apellidos" },
    { key: "fechaNac", label: "F. Nacimiento" },
    { key: "sexo", label: "Género" },
    { key: "eps", label: "EPS" },
    { key: "codDepto", label: "Cód. depto" },
    { key: "codMunicipio", label: "Cód. municipio" },
    { key: "direccion", label: "Dirección" },
    { key: "telefono", label: "Teléfono" },
    { key: "correo", label: "Correo" },
];

const TITULO_REPORTE = "Datos para ARL";
const COLOR_PRIMARIO = [239, 68, 68]; // rojo
const ROJO_ARGB = "FFEF4444";


// -----------------------------------------------------------------------
// Utilidades
// -----------------------------------------------------------------------

const formatCell = (row, column) => row[column.key] ?? "";

const formatFecha = (valor) =>
    valor ? new Date(valor).toLocaleDateString("es-CO") : "—";

// Carga una imagen y devuelve { dataUrl, ratio } (ancho / alto)
const cargarLogo = (src) =>
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

        img.src = src;
    });

const descargarBlob = (blob, nombre) => {
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = nombre;
    enlace.click();

    URL.revokeObjectURL(url);
};


// -----------------------------------------------------------------------
// Exportar a Excel (con logos y encabezado)
// -----------------------------------------------------------------------

async function exportarXlsx({ rows, periodo, fileName }) {

    const [logo, logoProg] = await Promise.all([
        cargarLogo(logoSisprac),
        cargarLogo(logoPrograma),
    ]);

    const wb = new ExcelJS.Workbook();

    const ws = wb.addWorksheet("Datos ARL", {
        views: [{ state: "frozen", ySplit: 6 }],
    });

    const totalColumnas = COLUMNS.length;
    const totalEncabezado = Math.max(totalColumnas, 6);

    const altoFila = 24;
    const filasLogo = 4;
    const columnasLogo = 2;
    const EMU = 9525;

    const anchos = Array.from({ length: totalEncabezado }, (_, i) =>
        COLUMNS[i]?.key === "correo" || COLUMNS[i]?.key === "direccion" ? 30 : 20
    );

    const pxAncho = (w) => w * 7 + 5;
    const pxFila = altoFila * (96 / 72);

    ws.columns = anchos.map((width) => ({ width }));

    for (let fila = 1; fila <= filasLogo; fila++) {
        ws.getRow(fila).height = altoFila;
    }

    ws.getRow(5).height = 8;

    const agregarImagen = (img, colIni, nCols) => {

        if (!img) return;

        const pxCols = anchos.slice(colIni, colIni + nCols).map(pxAncho);
        const cajaAncho = pxCols.reduce((a, b) => a + b, 0);
        const cajaAlto = pxFila * filasLogo;

        const margen = 10;
        const maxAncho = cajaAncho - margen * 2;
        const maxAlto = cajaAlto - margen * 2;

        let alto = maxAlto;
        let ancho = alto * img.ratio;

        if (ancho > maxAncho) {
            ancho = maxAncho;
            alto = ancho / img.ratio;
        }

        const offsetX = (cajaAncho - ancho) / 2;
        const offsetY = (cajaAlto - alto) / 2;

        let acumulado = 0;
        let idx = 0;

        while (idx < pxCols.length - 1 && acumulado + pxCols[idx] <= offsetX) {
            acumulado += pxCols[idx];
            idx++;
        }

        const filaInicio = Math.floor(offsetY / pxFila);

        const idImagen = wb.addImage({
            base64: img.dataUrl.split(",")[1],
            extension: "png",
        });

        ws.addImage(idImagen, {
            tl: {
                nativeCol: colIni + idx,
                nativeColOff: Math.round((offsetX - acumulado) * EMU),
                nativeRow: filaInicio,
                nativeRowOff: Math.round((offsetY - filaInicio * pxFila) * EMU),
            },
            ext: { width: ancho, height: alto },
        });
    };

    const colDerecha = totalEncabezado - columnasLogo + 1;

    ws.mergeCells(1, 1, filasLogo, columnasLogo);
    ws.mergeCells(1, colDerecha, filasLogo, totalEncabezado);

    agregarImagen(logo, 0, columnasLogo);
    agregarImagen(logoProg, colDerecha - 1, columnasLogo);

    const colTexto = columnasLogo + 1;
    const colTextoFin = colDerecha - 1;

    const escribirTexto = (fila, valor, font) => {

        ws.mergeCells(fila, colTexto, fila, colTextoFin);

        const celda = ws.getCell(fila, colTexto);

        celda.value = valor;
        celda.font = font;
        celda.alignment = { vertical: "middle", horizontal: "center" };
    };

    escribirTexto(1, TITULO_REPORTE, {
        bold: true,
        size: 18,
        color: { argb: "FF1F2937" },
    });

    escribirTexto(
        2,
        periodo ? `Período lectivo: ${periodo}` : "Todos los períodos",
        { bold: true, size: 12, color: { argb: ROJO_ARGB } }
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

    for (let col = 1; col <= totalEncabezado; col++) {
        ws.getCell(filasLogo, col).border = {
            bottom: { style: "medium", color: { argb: ROJO_ARGB } },
        };
    }

    // Fila 6: encabezados de la tabla
    const encabezado = ws.getRow(6);

    encabezado.values = COLUMNS.map((c) => c.label);
    encabezado.height = 26;

    encabezado.eachCell((celda) => {
        celda.font = { bold: true, color: { argb: "FFFFFFFF" } };
        celda.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ROJO_ARGB } };
        celda.alignment = { vertical: "middle", horizontal: "center" };
    });

    // Filas de datos
    const borde = { style: "thin", color: { argb: "FFE5E7EB" } };

    rows.forEach((row, i) => {

        const fila = ws.addRow(COLUMNS.map((c) => formatCell(row, c)));

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

    const buffer = await wb.xlsx.writeBuffer();

    descargarBlob(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `${fileName}.xlsx`
    );
}


// -----------------------------------------------------------------------
// Exportar a PDF (con logos y encabezado)
// -----------------------------------------------------------------------

async function exportarPdf({ rows, periodo, fileName }) {

    const [logo, logoProg] = await Promise.all([
        cargarLogo(logoSispracPDF),
        cargarLogo(logoPrograma),
    ]);

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
    });

    const anchoPagina = doc.internal.pageSize.getWidth();
    const altoPagina = doc.internal.pageSize.getHeight();
    const margenX = 30;
    const altoLogoIzq = 60;
    const altoLogoDer = 34;

    const fecha = new Date().toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const dibujarEncabezado = () => {

        let textoX = margenX;
        let derechaX = anchoPagina - margenX;

        if (logoProg) {
            const anchoIzq = altoLogoIzq * logoProg.ratio;

            doc.addImage(logoProg.dataUrl, "PNG", margenX, 15, anchoIzq, altoLogoIzq);

            textoX = margenX + anchoIzq + 14;
        }

        if (logo) {
            const anchoDer = altoLogoDer * logo.ratio;
            const xDer = anchoPagina - margenX - anchoDer;

            doc.addImage(logo.dataUrl, "PNG", xDer, 24, anchoDer, altoLogoDer);

            derechaX = xDer - 14;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(31, 41, 55);
        doc.text(TITULO_REPORTE, textoX, 40);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(...COLOR_PRIMARIO);
        doc.text(
            periodo ? `Período lectivo: ${periodo}` : "Todos los períodos",
            textoX,
            57
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(`Generado el ${fecha}`, derechaX, 40, { align: "right" });
        doc.text(`Total de registros: ${rows.length}`, derechaX, 55, {
            align: "right",
        });

        doc.setDrawColor(...COLOR_PRIMARIO);
        doc.setLineWidth(1.5);
        doc.line(margenX, 70, anchoPagina - margenX, 70);
    };

    autoTable(doc, {
        head: [COLUMNS.map((c) => c.label)],
        body: rows.map((row) => COLUMNS.map((c) => formatCell(row, c))),
        startY: 84,
        margin: { top: 84, left: margenX, right: margenX, bottom: 40 },
        styles: {
            font: "helvetica",
            fontSize: 7.5,
            cellPadding: 4,
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
}


// -----------------------------------------------------------------------
// Menú de descarga (solo Excel y PDF)
// -----------------------------------------------------------------------

function DescargarMenu({ rows, periodo, disabled }) {

    const [open, setOpen] = useState(false);
    const [generando, setGenerando] = useState(null); // "xlsx" | "pdf" | null

    const fileName = `datos_arl${periodo ? `_${String(periodo).replace(/\s+/g, "_")}` : ""}`;

    const ejecutar = async (tipo, fn, etiqueta) => {

        try {

            setGenerando(tipo);

            await fn({ rows, periodo, fileName });

            toast.success(`Archivo ${etiqueta} descargado correctamente.`);

            setOpen(false);

        } catch (error) {

            console.error(`Error al descargar ${etiqueta}:`, error);

            toast.error(`No se pudo descargar el archivo ${etiqueta}.`);

        } finally {

            setGenerando(null);
        }
    };

    const opciones = [
        {
            tipo: "xlsx",
            titulo: "Excel",
            detalle: "Hoja de cálculo (.xlsx)",
            icono: FileSpreadsheet,
            estilo: "bg-emerald-50 text-emerald-600",
            accion: () => ejecutar("xlsx", exportarXlsx, "Excel"),
        },
        {
            tipo: "pdf",
            titulo: "PDF",
            detalle: "Documento imprimible (.pdf)",
            icono: FileText,
            estilo: "bg-red-50 text-red-500",
            accion: () => ejecutar("pdf", exportarPdf, "PDF"),
        },
    ];

    return (

        <div className="relative">

            <button
                onClick={() => setOpen((o) => !o)}
                disabled={disabled}
                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-500/20 transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >

                <Download size={16} />

                Descargar

                <ChevronDown
                    size={14}
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                />

            </button>

            {open && (

                <>

                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => !generando && setOpen(false)}
                    />

                    <div className="absolute bottom-14 right-0 z-20 w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl">

                        {opciones.map(({ tipo, titulo, detalle, icono: Icono, estilo, accion }) => (

                            <button
                                key={tipo}
                                onClick={accion}
                                disabled={Boolean(generando)}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:cursor-wait disabled:opacity-60"
                            >

                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${estilo}`}>

                                    {generando === tipo
                                        ? <Loader2 size={18} className="animate-spin" />
                                        : <Icono size={18} />}

                                </span>

                                <span className="min-w-0">

                                    <span className="block text-sm font-semibold text-gray-800">
                                        {titulo}
                                    </span>

                                    <span className="block text-xs text-gray-400">
                                        {detalle}
                                    </span>

                                </span>

                            </button>

                        ))}

                    </div>

                </>

            )}

        </div>
    );
}


// -----------------------------------------------------------------------
// Tarjeta de dato de la práctica
// -----------------------------------------------------------------------

function InfoItem({ icon: Icon, label, children }) {

    return (

        <div className="flex items-center gap-3">

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-red-500 shadow-sm">
                <Icon size={17} />
            </span>

            <div className="min-w-0">

                <p className="text-xs text-gray-400">{label}</p>

                <div className="text-sm font-semibold text-gray-800">
                    {children}
                </div>

            </div>

        </div>
    );
}


// -----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------

export default function DatosArl() {

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [practicas, setPracticas] = useState([]);
    const [practicaSeleccionada, setPracticaSeleccionada] = useState("");

    const [cargandoPracticas, setCargandoPracticas] = useState(false);
    const [cargandoPracticantes, setCargandoPracticantes] = useState(false);


    // ---------------------------------------------------------------
    // Cargar prácticas
    // ---------------------------------------------------------------

    useEffect(() => {
        loadPracticas();
    }, []);

    const loadPracticas = async () => {

        try {

            setCargandoPracticas(true);

            const data = await getPracticas({ practicaRepository });

            setPracticas(data || []);

        } catch (error) {

            console.error("Error al cargar las prácticas:", error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "No se pudieron cargar las prácticas."
            );

        } finally {

            setCargandoPracticas(false);
        }
    };


    // ---------------------------------------------------------------
    // Cuando cambia la práctica
    // ---------------------------------------------------------------

    useEffect(() => {

        if (!practicaSeleccionada) {
            setRows([]);
            setCurrentPage(1);
            return;
        }

        loadPracticantesPorPractica(practicaSeleccionada);

    }, [practicaSeleccionada]);

    const loadPracticantesPorPractica = async (practicaId) => {

        try {

            setCargandoPracticantes(true);

            const data = await obtenerPracticantesPorPractica(
                { practicanteRepository },
                practicaId
            );

            const formattedData = (data || []).map((practicante) => {

                const usuario = practicante.candidato?.Usuario;

                return {
                    id: practicante.id,
                    tipoDoc: usuario?.tipo_documento ?? "",
                    numDoc: usuario?.cedula ?? "",
                    nombres: usuario?.nombres ?? "",
                    apellidos: usuario?.apellidos ?? "",
                    fechaNac: practicante.fecha_nacimiento ?? "",
                    sexo: practicante.genero ?? "",
                    eps: practicante.eps ?? "",
                    codDepto: practicante.codigoDepResidencia ?? "",
                    codMunicipio: practicante.codigoMunResidencia ?? "",
                    direccion: practicante.direccion ?? "",
                    telefono: usuario?.telefono ?? "",
                    correo: usuario?.correo ?? "",
                };
            });

            setRows(formattedData);
            setCurrentPage(1);

        } catch (error) {

            console.error("Error al cargar los practicantes de la práctica:", error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "No se pudieron cargar los practicantes."
            );

            setRows([]);

        } finally {

            setCargandoPracticantes(false);
        }
    };


    // ---------------------------------------------------------------
    // Práctica seleccionada y su estado
    // ---------------------------------------------------------------

    const practicaActual = practicas.find(
        (practica) => String(practica.id) === String(practicaSeleccionada)
    );

    const periodo = practicaActual?.Periodo?.nombre || "";

    const fechaFinPractica = practicaActual?.fecha_fin
        ? new Date(practicaActual.fecha_fin)
        : null;

    const estadoBackend = practicaActual?.estado
        ? String(practicaActual.estado).toUpperCase()
        : null;

    const practicaFinalizada = estadoBackend
        ? estadoBackend === "FINALIZADA"
        : Boolean(fechaFinPractica && fechaFinPractica <= new Date());


    return (

        <div className="mx-auto max-w-6xl px-4 py-8">

            {/* Encabezado */}
            <div className="mb-8 text-center">

                <h1 className="text-2xl font-bold text-gray-900">
                    Datos para ARL
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                    Selecciona una práctica para consultar y descargar los datos de sus practicantes.
                </p>

            </div>


            {/* Selector + información */}
            <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-end">

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Práctica
                        </label>

                        <select
                            value={practicaSeleccionada}
                            onChange={(e) => setPracticaSeleccionada(e.target.value)}
                            disabled={cargandoPracticas}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        >

                            <option value="">
                                {cargandoPracticas
                                    ? "Cargando prácticas..."
                                    : "Selecciona una práctica"}
                            </option>

                            {practicas.map((practica) => (
                                <option key={practica.id} value={practica.id}>
                                    {practica.Periodo?.nombre || `Práctica ${practica.id}`}
                                </option>
                            ))}

                        </select>

                    </div>


                    {practicaActual ? (

                        <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 px-4 py-3 sm:grid-cols-4">

                            <InfoItem icon={CalendarDays} label="Inicio">
                                {formatFecha(practicaActual.fecha_inicio)}
                            </InfoItem>

                            <InfoItem icon={CalendarCheck} label="Finalización">
                                {formatFecha(practicaActual.fecha_fin)}
                            </InfoItem>

                            <InfoItem icon={Users} label="Practicantes">
                                {cargandoPracticantes ? "…" : rows.length}
                            </InfoItem>

                            <div className="flex items-center">

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${practicaFinalizada
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-amber-50 text-amber-600"
                                        }`}
                                >

                                    {practicaFinalizada
                                        ? <CheckCircle2 size={13} />
                                        : <Clock size={13} />}

                                    {practicaFinalizada ? "Finalizada" : "En curso"}

                                </span>

                            </div>

                        </div>

                    ) : (

                        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 px-4 py-4 text-center text-sm text-gray-400">
                            Aquí verás la información de la práctica seleccionada.
                        </div>

                    )}

                </div>

            </div>


            {/* Tabla */}
            <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">

                {cargandoPracticantes ? (

                    <div className="flex items-center justify-center gap-2 py-14 text-sm text-gray-500">
                        <Loader2 size={18} className="animate-spin text-red-500" />
                        Cargando practicantes...
                    </div>

                ) : (

                    <GenericTable
                        rows={rows}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        columns={COLUMNS.map(({ key, label, primary }) => ({
                            key,
                            label: key === "tipoDoc" ? "Tipo" : label,
                            ...(primary ? { primary: true } : {}),
                        }))}
                        emptyMessage={
                            practicaSeleccionada
                                ? "No hay practicantes registrados en esta práctica."
                                : "Selecciona una práctica."
                        }
                        pageSize={7}
                    />

                )}

            </div>


            {/* Acciones */}
            <div className="mt-6 flex items-center justify-between gap-3">

                <p className="text-xs text-gray-400">
                    {rows.length > 0
                        ? `${rows.length} practicante${rows.length === 1 ? "" : "s"} listos para exportar`
                        : ""}
                </p>

                <DescargarMenu
                    rows={rows}
                    periodo={periodo}
                    disabled={!practicaSeleccionada || cargandoPracticantes || rows.length === 0}
                />

            </div>

        </div>
    );
}