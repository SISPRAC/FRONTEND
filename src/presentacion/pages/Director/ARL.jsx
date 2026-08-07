import React, { useRef, useState, useEffect } from "react";
import { Download, Upload, X, Paperclip, FileSpreadsheet, FileText, File } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import Layout from "../../shared/Layouts/Layout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { practicanteRepository } from "../../../infraestructura/repository/practicanteRepository.js";
import { getPracticantes } from "../../../aplicacion/practicante/getPracticantes.js";

// -----------------------------------------------------------------------
// Encabezados legibles para exportar (Excel / PDF / CSV) y para mapear
// las columnas que llegan de tu API a un formato consistente.
// -----------------------------------------------------------------------
const FIELDS = [
    "tipoDoc", "numDoc", "nombres", "apellidos", "fechaNac", "sexo", "eps",
    "codDepto", "codMunicipio", "direccion",
    "telefono", "correo",
];

const HEADERS = {
    tipoDoc: "Tipo de documento",
    numDoc: "Número de documento",
    nombres: "Nombres",
    apellidos: "Apellidos",
    fechaNac: "Fecha de nacimiento",
    sexo: "Genero",
    eps: "EPS",
    codDepto: "Código departamento",
    codMunicipio: "Código municipio",
    direccion: "Dirección",
    telefono: "Teléfono",
    correo: "Correo electrónico",
};

// -----------------------------------------------------------------------
// Modal para enviar el archivo de ARL. Se abre al pulsar "Subir ARL".
// -----------------------------------------------------------------------
function EnviarArlModal({ open, onClose, onEnviar }) {
    const [file, setFile] = useState(null);
    const [nota, setNota] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    if (!open) return null;

    const handleFile = (f) => {
        if (!f) return;
        setFile(f);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
    };

    const reset = () => {
        setFile(null);
        setNota("");
        setEnviando(false);
    };

    const handleCancelar = () => {
        reset();
        onClose();
    };

    const handleEnviar = async () => {
        if (!file) return;
        setEnviando(true);
        try {
            await onEnviar?.({ file, nota });
            reset();
            onClose();
        } catch (err) {
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Enviar ARL</h2>
                    <button
                        onClick={handleCancelar}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-4 px-5 py-5">
                    <p className="text-sm text-gray-500">
                        Adjunta el archivo con los datos de la ARL que deseas enviar.
                    </p>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${dragOver ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv,.pdf"
                            className="hidden"
                            onChange={(e) => handleFile(e.target.files?.[0])}
                        />
                        {file ? (
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Paperclip size={16} className="text-red-500" />
                                {file.name}
                            </div>
                        ) : (
                            <>
                                <Upload size={20} className="text-gray-400" />
                                <p className="text-sm text-gray-500">
                                    Arrastra el archivo aquí o <span className="text-red-500 underline">selecciónalo</span>
                                </p>
                                <p className="text-xs text-gray-400">.xlsx, .csv o .pdf</p>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Nota (opcional)
                        </label>
                        <textarea
                            value={nota}
                            onChange={(e) => setNota(e.target.value)}
                            rows={2}
                            placeholder="Comentario para la aseguradora..."
                            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
                    <button
                        onClick={handleCancelar}
                        disabled={enviando}
                        className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleEnviar}
                        disabled={!file || enviando}
                        className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {enviando ? "Enviando..." : "Enviar"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Menú de descarga (Excel / PDF / CSV) construido a partir de `rows`.
// -----------------------------------------------------------------------
function DescargarMenu({ rows }) {
    const [open, setOpen] = useState(false);

    const toAoa = () => [FIELDS.map((f) => HEADERS[f]), ...rows.map((r) => FIELDS.map((f) => r[f] ?? ""))];

    const descargarXlsx = () => {
        const ws = XLSX.utils.aoa_to_sheet(toAoa());
        ws["!cols"] = FIELDS.map(() => ({ wch: 18 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Datos ARL");
        XLSX.writeFile(wb, "datos_arl.xlsx");
        setOpen(false);
    };

    const descargarCsv = () => {
        const aoa = toAoa();
        const csv = aoa
            .map((row) => row.map((cell) => {
                const s = String(cell ?? "");
                return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
            }).join(";"))
            .join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "datos_arl.csv";
        a.click();
        URL.revokeObjectURL(url);
        setOpen(false);
    };

    const descargarPdf = () => {
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
        doc.setFontSize(16);
        doc.text("Datos para ARL", 40, 40);
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Generado el ${new Date().toLocaleDateString("es-CO")}`, 40, 56);

        autoTable(doc, {
            head: [FIELDS.map((f) => HEADERS[f])],
            body: rows.map((r) => FIELDS.map((f) => r[f] ?? "")),
            startY: 72,
            styles: { fontSize: 7.5, cellPadding: 4 },
            headStyles: { fillColor: [232, 51, 44], textColor: 255, fontStyle: "bold" },
            alternateRowStyles: { fillColor: [250, 250, 251] },
            margin: { left: 30, right: 30 },
        });

        doc.save("datos_arl.pdf");
        setOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
            >
                <Download size={16} />
                Descargar
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute bottom-12 right-0 z-20 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
                        <button
                            onClick={descargarXlsx}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >
                            <FileSpreadsheet size={16} /> Descargar Excel (.xlsx)
                        </button>
                        <button
                            onClick={descargarPdf}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >
                            <FileText size={16} /> Descargar PDF
                        </button>
                        <button
                            onClick={descargarCsv}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >
                            <File size={16} /> Descargar CSV
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// -----------------------------------------------------------------------
// Componente principal. `rows` debe venir de tu base de datos / API,
// ya con la forma { tipoDoc, numDoc, nombres, apellidos, fechaNac, sexo,
// eps, departamento, codDepto, municipio, codMunicipio, direccion,
// telefono, correo, ... }. No se agregan filas manualmente aquí.
// -----------------------------------------------------------------------
export default function DatosArl({ onEnviarArl }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadPracticantes();
    }, []);

    const loadPracticantes = async () => {

        try {

            const data = await getPracticantes({
                practicanteRepository
            });

            console.log("DATA PRACTICANTES:", data);

            const formattedData = data.map(practicante => ({
                ...practicante
            }));

            console.log("FORMATTED DATA:", formattedData);

            setRows(formattedData);
            setCurrentPage(1);

        } catch (error) {

            console.error("Error al cargar practicantes:", error);

        }

    };

    const handleEnviar = async ({ file, nota }) => {
        // TODO: reemplaza esto por tu llamada real, por ejemplo:
        // const formData = new FormData();
        // formData.append("archivo", file);
        // formData.append("nota", nota);
        // await api.post("/arl/enviar", formData);
        if (onEnviarArl) {
            await onEnviarArl({ file, nota });
        } else {
            console.log("Enviar ARL ->", file?.name, nota);
        }
    };

    return (
        <Layout
        footerLabel="Director">
            <div className="mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Datos para ARL</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Información de afiliación cargada desde la base de datos.
                    </p>
                </div>

                <GenericTable
                    rows={rows}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    columns={[
                        { key: "numDoc", label: "Cedula", primary: true },
                        { key: "tipoDoc", label: "Tipo." },
                        { key: "nombres", label: "Nombres" },
                        { key: "apellidos", label: "Apellidos" },
                        { key: "fechaNac", label: "F. Nacimiento" },
                        { key: "sexo", label: "Genero" },
                        { key: "eps", label: "EPS" },
                        { key: "codDepto", label: "Cód. depto" },
                        { key: "codMunicipio", label: "Cód. municipio" },
                        { key: "direccion", label: "Dirección" },
                        { key: "telefono", label: "Teléfono" },
                        { key: "correo", label: "Correo" },
                    ]}
                    emptyMessage="No hay Practicantes registrados."
                    pageSize={7}
                />

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
                    >
                        <Upload size={16} />
                        Subir ARL
                    </button>
                    <DescargarMenu rows={rows} />
                </div>

                <EnviarArlModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onEnviar={handleEnviar}
                />
            </div>
        </Layout >

    );
}