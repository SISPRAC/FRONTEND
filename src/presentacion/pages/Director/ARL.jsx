import React, { useRef, useState, useEffect } from "react";
import {
    Download,
    Upload,
    X,
    Paperclip,
    FileSpreadsheet,
    FileText,
    File,
    Clock,
    CheckCircle2
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { practicanteRepository } from "../../../infraestructura/repository/practicanteRepository.js";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";

import { getPracticantes } from "../../../aplicacion/practicante/getPracticantes.js";
import { actualizarArlPractica } from "../../../aplicacion/practica/actualizarArlPractica.js";
import { obtenerPracticantesPorPractica } from "../../../aplicacion/practicante/obtenerPracticantesPorPractica.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";

import toast from "react-hot-toast";


// -----------------------------------------------------------------------
// Encabezados para exportar
// -----------------------------------------------------------------------

const FIELDS = [
    "tipoDoc",
    "numDoc",
    "nombres",
    "apellidos",
    "fechaNac",
    "sexo",
    "eps",
    "codDepto",
    "codMunicipio",
    "direccion",
    "telefono",
    "correo",
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
// Modal para enviar ARL
// -----------------------------------------------------------------------

function EnviarArlModal({
    open,
    onClose,
    onEnviar,
    bloqueado,
    fechaFinTexto,
    arlExistente
}) {

    const [file, setFile] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [editando, setEditando] = useState(false);

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

        setEnviando(false);
        setEditando(false);
    };

    const handleCancelar = () => {

        reset();

        onClose();
    };

    const handleEnviar = async () => {

        if (!file) {

            toast.error("Selecciona un archivo para continuar.");

            return;
        }

        setEnviando(true);

        try {

            await onEnviar?.({
                file
            });

            toast.success(
                arlExistente
                    ? "ARL actualizado correctamente."
                    : "ARL enviado correctamente."
            );

            reset();
            onClose();

        } catch (err) {

            console.error(
                "Error al enviar ARL:",
                err
            );

            toast.error(
                err?.response?.data?.message ||
                err?.message ||
                "Ocurrió un error al enviar el ARL."
            );

            setEnviando(false);
        }
    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

                    <h2 className="text-base font-semibold text-gray-900">

                        {arlExistente && !editando
                            ? "ARL enviada"
                            : arlExistente
                                ? "Actualizar ARL"
                                : "Enviar ARL"}

                    </h2>

                    <button
                        onClick={handleCancelar}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={18} />
                    </button>

                </div>

                {bloqueado ? (

                    <>

                        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                                <Clock size={22} />
                            </div>

                            <p className="text-sm font-semibold text-gray-800">
                                Ya no puedes modificar el ARL
                            </p>

                            <p className="max-w-xs text-sm text-gray-500">

                                La práctica ya finalizó
                                {fechaFinTexto ? ` el ${fechaFinTexto}` : ""}
                                , por lo que ya no es posible subir o actualizar el archivo.

                            </p>

                        </div>

                        <div className="flex justify-end border-t border-gray-100 px-5 py-4">

                            <button
                                onClick={handleCancelar}
                                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Entendido
                            </button>

                        </div>

                    </>

                ) : arlExistente && !editando ? (

                    // ------------------------------------------------
                    // YA EXISTE UN ARL
                    // ------------------------------------------------

                    <>

                        <div className="space-y-4 px-5 py-6">

                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500">
                                        <CheckCircle2 size={20} />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-sm font-semibold text-emerald-700">
                                            ARL enviado correctamente
                                        </p>

                                        <p className="text-xs text-emerald-600">
                                            Ya existe un archivo asociado a esta práctica.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {arlExistente.url && (

                                <a
                                    href={arlExistente.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 hover:bg-gray-50"
                                >

                                    <Paperclip
                                        size={18}
                                        className="text-red-500"
                                    />

                                    <div className="min-w-0 flex-1">

                                        <p className="truncate text-sm font-medium text-gray-700">
                                            {arlExistente.nombre || "Archivo ARL"}
                                        </p>

                                        <p className="text-xs text-gray-400">
                                            Ver archivo
                                        </p>

                                    </div>

                                </a>

                            )}

                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">

                            <button
                                onClick={handleCancelar}
                                className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            >
                                Cerrar
                            </button>

                            <button
                                onClick={() => setEditando(true)}
                                className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600"
                            >
                                Editar ARL
                            </button>

                        </div>

                    </>

                ) : (

                    // ------------------------------------------------
                    // SUBIR / ACTUALIZAR
                    // ------------------------------------------------

                    <>

                        <div className="space-y-4 px-5 py-5">

                            {arlExistente && (

                                <div className="rounded-lg bg-gray-50 px-3 py-2">

                                    <p className="text-xs text-gray-400">
                                        Archivo actual
                                    </p>

                                    <p className="truncate text-sm font-medium text-gray-700">
                                        {arlExistente.nombre || "ARL actual"}
                                    </p>

                                </div>

                            )}

                            <p className="text-sm text-gray-500">

                                {arlExistente
                                    ? "Selecciona el nuevo archivo para reemplazar el ARL actual."
                                    : "Adjunta el archivo con los datos de la ARL que deseas enviar."}

                            </p>

                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragOver(true);
                                }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${dragOver
                                        ? "border-red-400 bg-red-50"
                                        : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >

                                <input
                                    ref={inputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv,.pdf"
                                    className="hidden"
                                    onChange={(e) =>
                                        handleFile(e.target.files?.[0])
                                    }
                                />

                                {file ? (

                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">

                                        <Paperclip
                                            size={16}
                                            className="text-red-500"
                                        />

                                        {file.name}

                                    </div>

                                ) : (

                                    <>

                                        <Upload
                                            size={20}
                                            className="text-gray-400"
                                        />

                                        <p className="text-sm text-gray-500">

                                            Arrastra el archivo aquí o{" "}

                                            <span className="text-red-500 underline">
                                                selecciónalo
                                            </span>

                                        </p>

                                        <p className="text-xs text-gray-400">
                                            .xlsx, .csv o .pdf
                                        </p>

                                    </>

                                )}

                            </div>

                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">

                            <button
                                onClick={() => {

                                    if (arlExistente) {

                                        setEditando(false);
                                        setFile(null);

                                    } else {

                                        handleCancelar();

                                    }

                                }}
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

                                {enviando
                                    ? arlExistente
                                        ? "Actualizando..."
                                        : "Enviando..."
                                    : arlExistente
                                        ? "Actualizar ARL"
                                        : "Enviar ARL"}

                            </button>

                        </div>

                    </>

                )}

            </div>

        </div>
    );
}



// -----------------------------------------------------------------------
// Menú de descarga
// -----------------------------------------------------------------------

function DescargarMenu({ rows }) {

    const [open, setOpen] = useState(false);

    const toAoa = () => [

        FIELDS.map((f) => HEADERS[f]),

        ...rows.map((r) =>
            FIELDS.map((f) => r[f] ?? "")
        )

    ];

    const descargarXlsx = () => {

        try {

            const ws = XLSX.utils.aoa_to_sheet(toAoa());

            ws["!cols"] = FIELDS.map(() => ({
                wch: 18
            }));

            const wb = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                wb,
                ws,
                "Datos ARL"
            );

            XLSX.writeFile(
                wb,
                "datos_arl.xlsx"
            );

            toast.success(
                "Archivo Excel descargado correctamente."
            );

            setOpen(false);

        } catch (error) {

            console.error(
                "Error al descargar Excel:",
                error
            );

            toast.error(
                "No se pudo descargar el archivo Excel."
            );
        }
    };

    const descargarCsv = () => {

        try {

            const aoa = toAoa();

            const csv = aoa
                .map((row) =>
                    row
                        .map((cell) => {

                            const s = String(cell ?? "");

                            return /[",\n;]/.test(s)
                                ? `"${s.replace(/"/g, '""')}"`
                                : s;

                        })
                        .join(";")
                )
                .join("\n");

            const blob = new Blob(
                ["\uFEFF" + csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;

            a.download = "datos_arl.csv";

            a.click();

            URL.revokeObjectURL(url);

            toast.success(
                "Archivo CSV descargado correctamente."
            );

            setOpen(false);

        } catch (error) {

            console.error(
                "Error al descargar CSV:",
                error
            );

            toast.error(
                "No se pudo descargar el archivo CSV."
            );
        }
    };

    const descargarPdf = () => {

        try {

            const doc = new jsPDF({
                orientation: "landscape",
                unit: "pt",
                format: "a4"
            });

            doc.setFontSize(16);

            doc.text(
                "Datos para ARL",
                40,
                40
            );

            doc.setFontSize(9);

            doc.setTextColor(120);

            doc.text(
                `Generado el ${new Date().toLocaleDateString("es-CO")}`,
                40,
                56
            );

            autoTable(doc, {

                head: [
                    FIELDS.map((f) => HEADERS[f])
                ],

                body: rows.map((r) =>
                    FIELDS.map((f) => r[f] ?? "")
                ),

                startY: 72,

                styles: {
                    fontSize: 7.5,
                    cellPadding: 4
                },

                headStyles: {
                    fillColor: [232, 51, 44],
                    textColor: 255,
                    fontStyle: "bold"
                },

                alternateRowStyles: {
                    fillColor: [250, 250, 251]
                },

                margin: {
                    left: 30,
                    right: 30
                }

            });

            doc.save("datos_arl.pdf");

            toast.success(
                "Archivo PDF descargado correctamente."
            );

            setOpen(false);

        } catch (error) {

            console.error(
                "Error al descargar PDF:",
                error
            );

            toast.error(
                "No se pudo descargar el archivo PDF."
            );
        }
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

                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute bottom-12 right-0 z-20 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">

                        <button
                            onClick={descargarXlsx}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >

                            <FileSpreadsheet size={16} />

                            Descargar Excel (.xlsx)

                        </button>

                        <button
                            onClick={descargarPdf}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >

                            <FileText size={16} />

                            Descargar PDF

                        </button>

                        <button
                            onClick={descargarCsv}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600"
                        >

                            <File size={16} />

                            Descargar CSV

                        </button>

                    </div>

                </>

            )}

        </div>
    );
}


// -----------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// -----------------------------------------------------------------------

export default function DatosArl() {

    const [modalOpen, setModalOpen] = useState(false);

    const [rows, setRows] = useState([]);

    // URL/archivo de ARL ya subido para la práctica seleccionada (si existe)
    const [arl, setArl] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    // Prácticas
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

            const data = await getPracticas({
                practicaRepository
            });

            console.log("PRACTICAS:", data);

            setPracticas(data || []);

        } catch (error) {

            console.error(
                "Error al cargar las prácticas:",
                error
            );

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
            setArl(null);

            return;
        }

        loadPracticantesPorPractica(
            practicaSeleccionada
        );

    }, [practicaSeleccionada]);


    // Cuando cambia la práctica seleccionada (o llegan las prácticas),
    // revisamos si esa práctica ya tiene un ARL subido previamente.
    useEffect(() => {

        const practica = practicas.find(
            (p) => String(p.id) === String(practicaSeleccionada)
        );

        const archivoExistente = practica?.archivoArl || null;

        setArl(archivoExistente);

    }, [practicaSeleccionada, practicas]);


    const loadPracticantesPorPractica = async (practicaId) => {

        try {

            setCargandoPracticantes(true);

            const data =
                await obtenerPracticantesPorPractica(
                    {
                        practicanteRepository
                    },
                    practicaId
                );

            console.log(
                "PRACTICANTES DE LA PRÁCTICA:",
                data
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

            console.log(
                "FORMATTED DATA:",
                formattedData
            );

            setRows(formattedData);

            setCurrentPage(1);

        } catch (error) {

            console.error(
                "Error al cargar los practicantes de la práctica:",
                error
            );

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
    // Obtener práctica seleccionada
    // ---------------------------------------------------------------

    const practicaActual = practicas.find(
        (practica) =>
            String(practica.id) ===
            String(practicaSeleccionada)
    );


    // ---------------------------------------------------------------
    // Validar fecha de finalización
    // ---------------------------------------------------------------

    const fechaFinPractica = practicaActual?.fecha_fin
        ? new Date(practicaActual.fecha_fin)
        : null;

    const fechaActual = new Date();

    const estadoBackend = practicaActual?.estado
        ? String(practicaActual.estado).toUpperCase()
        : null;

    const practicaFinalizada = estadoBackend
        ? estadoBackend === "FINALIZADA"
        : Boolean(
            fechaFinPractica && fechaFinPractica <= fechaActual
        );

    const fechaFinTexto = fechaFinPractica
        ? fechaFinPractica.toLocaleDateString("es-CO")
        : null;

    // ¿Ya existe un ARL subido para esta práctica?
    const arlYaSubido = Boolean(arl);


    // ---------------------------------------------------------------
    // Subir / descargar ARL
    // ---------------------------------------------------------------

    const handleClickArl = () => {

        if (!practicaSeleccionada) {

            toast.error(
                "Primero debes seleccionar una práctica."
            );

            return;
        }

        if (practicaFinalizada && arlYaSubido) {

            handleDescargarArl();

            return;
        }

        setModalOpen(true);
    };


    const handleDescargarArl = () => {

        if (!arl?.url) {

            toast.error(
                "No se encontró el archivo ARL para descargar."
            );

            return;
        }

        try {

            const a = document.createElement("a");

            a.href = arl.url;

            a.target = "_blank";

            a.rel = "noopener noreferrer";

            a.download = "";

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            toast.success(
                "ARL descargado correctamente."
            );

        } catch (error) {

            console.error(
                "Error al descargar ARL:",
                error
            );

            toast.error(
                "No se pudo descargar el ARL."
            );
        }
    };


    const handleEnviar = async ({ file }) => {

        try {

            const resultado = await actualizarArlPractica(
                { practicaRepository },
                practicaSeleccionada,
                file
            );

            if (resultado) {

                setArl(
                    resultado?.arl ||
                    resultado?.archivo ||
                    resultado
                );
            }

        } catch (error) {

            console.error(
                "Error al actualizar ARL:",
                error
            );

            throw error;
        }
    };


    return (

        <div>

            <div className="mx-auto max-w-6xl px-4 py-8">

                <div className="mb-6 text-center">

                    <h1 className="text-2xl font-bold text-gray-900">
                        Datos para ARL
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Selecciona una práctica para consultar sus practicantes.
                    </p>

                </div>


                {/* ---------------------------------------------------
                    SELECT DE PRÁCTICA + INFO
                ---------------------------------------------------- */}

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Práctica
                        </label>

                        <select
                            value={practicaSeleccionada}
                            onChange={(e) =>
                                setPracticaSeleccionada(
                                    e.target.value
                                )
                            }
                            disabled={cargandoPracticas}
                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                        >

                            <option value="">

                                {cargandoPracticas
                                    ? "Cargando prácticas..."
                                    : "Selecciona una práctica"}

                            </option>

                            {practicas.map((practica) => (

                                <option
                                    key={practica.id}
                                    value={practica.id}
                                >

                                    {practica.Periodo?.nombre ||
                                        `Práctica ${practica.id}`}

                                </option>

                            ))}

                        </select>

                    </div>


                    {practicaActual ? (

                        <div className="flex items-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">

                            <div className="grid w-full grid-cols-3 gap-3">

                                <div>

                                    <p className="text-xs text-gray-400">
                                        Fecha de inicio
                                    </p>

                                    <p className="text-sm font-semibold text-gray-700">

                                        {practicaActual.fecha_inicio
                                            ? new Date(
                                                practicaActual.fecha_inicio
                                            ).toLocaleDateString("es-CO")
                                            : "—"}

                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-gray-400">
                                        Fecha de finalización
                                    </p>

                                    <p className="text-sm font-semibold text-gray-700">
                                        {fechaFinTexto || "—"}
                                    </p>

                                </div>


                                <div>

                                    <p className="text-xs text-gray-400">
                                        Estado
                                    </p>

                                    <span
                                        className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${practicaFinalizada
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-amber-50 text-amber-600"
                                            }`}
                                    >

                                        {practicaFinalizada ? (
                                            <CheckCircle2 size={12} />
                                        ) : (
                                            <Clock size={12} />
                                        )}

                                        {practicaFinalizada
                                            ? "Finalizada"
                                            : "En curso"}

                                    </span>

                                </div>

                            </div>

                        </div>

                    ) : (

                        <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-200 px-4 py-3 text-center text-sm text-gray-400">

                            Aquí verás la información de la práctica seleccionada.

                        </div>

                    )}

                </div>


                {/* ---------------------------------------------------
                    TABLA
                ---------------------------------------------------- */}

                {cargandoPracticantes ? (

                    <div className="py-10 text-center text-sm text-gray-500">
                        Cargando practicantes...
                    </div>

                ) : (

                    <GenericTable
                        rows={rows}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                        columns={[
                            {
                                key: "numDoc",
                                label: "Cedula",
                                primary: true
                            },
                            {
                                key: "tipoDoc",
                                label: "Tipo."
                            },
                            {
                                key: "nombres",
                                label: "Nombres"
                            },
                            {
                                key: "apellidos",
                                label: "Apellidos"
                            },
                            {
                                key: "fechaNac",
                                label: "F. Nacimiento"
                            },
                            {
                                key: "sexo",
                                label: "Genero"
                            },
                            {
                                key: "eps",
                                label: "EPS"
                            },
                            {
                                key: "codDepto",
                                label: "Cód. depto"
                            },
                            {
                                key: "codMunicipio",
                                label: "Cód. municipio"
                            },
                            {
                                key: "direccion",
                                label: "Dirección"
                            },
                            {
                                key: "telefono",
                                label: "Teléfono"
                            },
                            {
                                key: "correo",
                                label: "Correo"
                            },
                        ]}
                        emptyMessage={
                            practicaSeleccionada
                                ? "No hay practicantes registrados en esta práctica."
                                : "Selecciona una práctica."
                        }
                        pageSize={7}
                    />

                )}


                {/* ---------------------------------------------------
                    BOTONES
                ---------------------------------------------------- */}

                <div className="mt-6 flex justify-end gap-3">

                    <button
                        onClick={handleClickArl}
                        disabled={!practicaSeleccionada}
                        title={
                            !practicaSeleccionada
                                ? "Selecciona una práctica primero."
                                : practicaFinalizada && arlYaSubido
                                    ? "Descargar el ARL ya enviado"
                                    : practicaFinalizada
                                        ? "La práctica ya finalizó, no es posible subir el ARL."
                                        : "Subir ARL"
                        }
                        className="flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {practicaFinalizada && arlYaSubido ? (

                            <>
                                <Download size={16} />
                                Descargar ARL
                            </>

                        ) : (

                            <>
                                <Upload size={16} />
                                Subir ARL
                            </>

                        )}

                    </button>

                    <DescargarMenu rows={rows} />

                </div>


                <EnviarArlModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onEnviar={handleEnviar}
                    bloqueado={practicaFinalizada}
                    fechaFinTexto={fechaFinTexto}
                    arlExistente={arl}
                />

            </div>

        </div>

    );

}