import { useEffect, useRef, useState } from "react";
import { X, Upload, Check, AlertTriangle, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import GenericTable from "../Table/GenericTable";
import { parsearListado, leerExcelCrudo } from "../../components/utils/Parsearlistado";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository";
import { invitarCandidato } from "../../../aplicacion/candidato/invitarCandidato.js";
const ESTADOS = {
    NUEVO: { label: "Por invitar", cls: "bg-green-100 text-green-700" },
    REGISTRADO: { label: "Registrado", cls: "bg-slate-200 text-slate-600" },
    DUPLICADO: { label: "Repetido", cls: "bg-orange-100 text-orange-700" },
    SIN_CORREO: { label: "Sin correo", cls: "bg-red-100 text-red-700" },
};

const Badge = ({ estado }) => (
    <span className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold ${ESTADOS[estado].cls}`}>
        {ESTADOS[estado].label}
    </span>
);

// Texto en una sola línea; si no cabe, se corta con "…" y el nombre completo sale al pasar el mouse
const Linea = ({ children, max = "max-w-[200px]" }) => (
    <span title={children} className={`block truncate ${max}`}>
        {children}
    </span>
);

// ── Vista previa del archivo original ────────────────────────────────────────
const FILAS_PREVIEW = 12;

function VistaPrevia({ tipo, pdfUrl, filas }) {
    const [pag, setPag] = useState(0);

    if (tipo === "pdf") {
        return (
            <iframe
                src={pdfUrl}
                title="Vista previa del archivo"
                className="w-full h-[420px] rounded-lg border border-slate-200"
            />
        );
    }

    const total = Math.max(1, Math.ceil(filas.length / FILAS_PREVIEW));
    const visibles = filas.slice(pag * FILAS_PREVIEW, (pag + 1) * FILAS_PREVIEW);

    return (
        <div className="h-[420px] flex flex-col rounded-lg border border-slate-200 overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <table className="w-full text-xs">
                    <tbody>
                        {visibles.map((fila, i) => (
                            <tr key={i} className="border-b border-slate-100 last:border-0">
                                {fila.map((celda, j) => (
                                    <td key={j} title={String(celda)} className="px-2 py-1.5 truncate max-w-[110px] text-slate-700">
                                        {String(celda)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
                <button
                    type="button"
                    disabled={pag === 0}
                    onClick={() => setPag((p) => p - 1)}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                >
                    <ChevronLeft size={16} />
                </button>
                <span>Filas del archivo · {pag + 1} / {total}</span>
                <button
                    type="button"
                    disabled={pag >= total - 1}
                    onClick={() => setPag((p) => p + 1)}
                    className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
}

export default function InvitarCandidatosModal({
    isOpen,
    onClose,
    candidatosRegistrados = [],
    onInvitados,
}) {
    // paso: "subir" -> "revisar"
    const [paso, setPaso] = useState("subir");
    const [analizados, setAnalizados] = useState([]);
    const [archivo, setArchivo] = useState("");
    const [tipo, setTipo] = useState(null); // "pdf" | "excel"
    const [pdfUrl, setPdfUrl] = useState(null);
    const [filasCrudas, setFilasCrudas] = useState([]);
    const [leyendo, setLeyendo] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [progreso, setProgreso] = useState({ actual: 0, total: 0 });
    const [currentPage, setCurrentPage] = useState(1);
    const fileRef = useRef(null);

    // Libera la URL del PDF al cambiarla o desmontar
    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

    if (!isOpen) return null;

    const porInvitar = analizados.filter((a) => a.estadoAnalisis === "NUEVO");

    const reset = () => {
        setPaso("subir");
        setAnalizados([]);
        setArchivo("");
        setTipo(null);
        setPdfUrl(null);
        setFilasCrudas([]);
        setProgreso({ actual: 0, total: 0 });
        setCurrentPage(1);
    };

    const cerrar = () => {
        if (enviando) return;
        reset();
        onClose();
    };

    const analizar = (alumnos) => {
        const codigos = new Set(candidatosRegistrados.map((c) => String(c.codigo)));
        const correos = new Set(candidatosRegistrados.map((c) => c.correo?.toLowerCase()));
        const vistos = new Set();

        return alumnos.map((a, i) => {
            let estadoAnalisis = "NUEVO";
            if (!a.correo) estadoAnalisis = "SIN_CORREO";
            else if (codigos.has(String(a.codigo)) || correos.has(a.correo))
                estadoAnalisis = "REGISTRADO";
            else if (vistos.has(a.correo) || vistos.has(a.codigo))
                estadoAnalisis = "DUPLICADO";

            vistos.add(a.correo);
            vistos.add(a.codigo);
            return { ...a, id: i, estadoAnalisis };
        });
    };

    const handleArchivo = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        try {
            setLeyendo(true);
            const alumnos = await parsearListado(file);

            if (alumnos.length === 0) {
                toast.error("No se encontraron estudiantes en el archivo.");
                return;
            }

            // Vista previa según el tipo de archivo
            if (file.name.toLowerCase().endsWith(".pdf")) {
                setTipo("pdf");
                setPdfUrl(URL.createObjectURL(file));
            } else {
                setTipo("excel");
                setFilasCrudas(await leerExcelCrudo(file));
            }

            setAnalizados(analizar(alumnos));
            setArchivo(file.name);
            setCurrentPage(1);
            setPaso("revisar");
        } catch (error) {
            console.error(error);
            toast.error(
                error.message === "FORMATO_NO_SOPORTADO"
                    ? "Solo se permiten archivos PDF o Excel (.xlsx)."
                    : "No fue posible leer el archivo."
            );
        } finally {
            setLeyendo(false);
        }
    };

    const confirmar = async () => {
        if (porInvitar.length === 0) {
            toast.error("No hay candidatos nuevos por invitar.");
            return;
        }

        setEnviando(true);
        setProgreso({ actual: 0, total: porInvitar.length });

        let ok = 0;
        const fallidos = [];

        // Se continúa aunque uno falle, para no perder el resto
        for (let i = 0; i < porInvitar.length; i++) {
            const c = porInvitar[i];
            try {
                await invitarCandidato(candidatoRepository, {
                    nombre: c.nombre,
                    correo: c.correo,
                    codigo: c.codigo,
                });
                ok++;
            } catch (error) {
                console.error(error);
                toast.error(error.response?.data?.message || `No se pudo invitar a ${c.correo}`);
                fallidos.push(c.id);
            }
            setProgreso({ actual: i + 1, total: porInvitar.length });
        }

        setEnviando(false);

        if (ok > 0) toast.success(`${ok} invitación(es) enviada(s).`);
        if (fallidos.length > 0) {
            toast.error(`${fallidos.length} invitación(es) fallaron. Puedes reintentar.`);
            // Dejamos solo los fallidos para reintentar
            setAnalizados((prev) => prev.filter((a) => fallidos.includes(a.id)));
            setCurrentPage(1);
            onInvitados?.();
            return;
        }

        onInvitados?.();
        reset();
        onClose();
    };

    const resumen = Object.keys(ESTADOS).map((k) => ({
        k,
        n: analizados.filter((a) => a.estadoAnalisis === k).length,
    }));

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div
                className={`bg-white w-full ${paso === "revisar" ? "max-w-6xl" : "max-w-2xl"} rounded-2xl p-8 shadow-xl relative`}
            >
                <button
                    type="button"
                    onClick={cerrar}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-extrabold text-slate-800 mb-6 text-center">
                    Invitar candidatos
                </h2>

                {paso === "subir" && (
                    <div className="text-center">
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".pdf,.xlsx,.xls"
                            onChange={handleArchivo}
                            className="hidden"
                        />

                        <button
                            type="button"
                            disabled={leyendo}
                            onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-12 hover:border-[#e8192c] hover:bg-red-50/40 transition disabled:opacity-60"
                        >
                            <Upload size={36} className="mx-auto mb-3 text-slate-400" />
                            <p className="font-semibold text-slate-700">
                                {leyendo ? "Analizando archivo..." : "Seleccionar listado de estudiantes"}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">PDF o Excel (.xlsx)</p>
                        </button>
                    </div>
                )}

                {paso === "revisar" && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                            {/* IZQUIERDA: análisis */}
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                                    {resumen.filter((r) => r.n > 0).map((r) => (
                                        <span key={r.k} className="flex items-center gap-2 text-sm">
                                            <Badge estado={r.k} /> <strong>{r.n}</strong>
                                        </span>
                                    ))}
                                </div>

                                <GenericTable
                                    rows={analizados}
                                    currentPage={currentPage}
                                    onPageChange={setCurrentPage}
                                    columns={[
                                        { key: "codigo", label: "Código", primary: true },
                                        {
                                            key: "nombre",
                                            label: "Nombre",
                                            render: (row) => <Linea max="max-w-[180px]">{row.nombre}</Linea>,
                                        },
                                        {
                                            key: "correo",
                                            label: "Correo",
                                            render: (row) => <Linea max="max-w-[190px]">{row.correo}</Linea>,
                                        },
                                        {
                                            key: "estadoAnalisis",
                                            label: "Estado",
                                            render: (row) => <Badge estado={row.estadoAnalisis} />,
                                        },
                                    ]}
                                    emptyMessage="Sin estudiantes"
                                    pageSize={7}
                                />

                                {porInvitar.length === 0 && (
                                    <p className="mt-3 flex items-center gap-2 text-sm text-orange-600 font-semibold">
                                        <AlertTriangle size={16} /> No hay candidatos nuevos por invitar.
                                    </p>
                                )}
                            </div>

                            {/* DERECHA: archivo original */}
                            <div className="min-w-0">
                                <p className="flex items-center gap-2 text-sm text-slate-600 mb-4 h-[26px]">
                                    <FileSpreadsheet size={18} className="shrink-0" />
                                    <span className="truncate" title={archivo}>{archivo}</span>
                                </p>
                                <VistaPrevia tipo={tipo} pdfUrl={pdfUrl} filas={filasCrudas} />
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 pt-6">
                            <button
                                type="button"
                                disabled={enviando}
                                onClick={reset}
                                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm font-semibold disabled:opacity-50"
                            >
                                Cambiar archivo
                            </button>

                            <button
                                type="button"
                                disabled={enviando || porInvitar.length === 0}
                                onClick={confirmar}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#e8192c] text-white hover:bg-[#c8111f] text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Check size={18} />
                                {enviando
                                    ? `Enviando... ${progreso.actual}/${progreso.total}`
                                    : `Confirmar invitación (${porInvitar.length})`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}