import { useState, useMemo, useEffect } from "react";
import {
    X,
    Plus,
    Send,
    ArrowLeft,
    CalendarDays
} from "lucide-react";
import toast from "react-hot-toast";
import EstadoBadge from "../estadoBadge/EstadoBadge";

const FECHA_VACIA = {
    fecha_inicio: "",
    fecha_fin: "",
    hora_inicio: "",
    hora_fin: ""
};

/**
 * Modal para solicitar visitas.
 *
 * Paso 1: seleccionar practicantes (agrupados por empresa, una sola empresa por solicitud).
 * Paso 2: proponer disponibilidades y enviar.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - practicantes: [{ id, codigo, practicante, empresa, estado }]
 *  - onSubmit: async ({ practicantes: number[], fechas: [] }) => void
 *  - enviando: boolean
 *  - idsConSolicitud: Set<number> con los ids de practicantes que ya
 *    tienen una solicitud de visita registrada (no se pueden volver a
 *    seleccionar).
 */
const SolicitudVisitaModal = ({
    open,
    onClose,
    practicantes = [],
    onSubmit,
    enviando = false,
    idsConSolicitud = new Set()
}) => {

    const [paso, setPaso] = useState(1);
    const [seleccionados, setSeleccionados] = useState([]);
    const [fechas, setFechas] = useState([FECHA_VACIA]);

    useEffect(() => {

        if (open) {

            setPaso(1);
            setSeleccionados([]);
            setFechas([FECHA_VACIA]);

        }

    }, [open]);

    const empresasAgrupadas = useMemo(
        () =>
            practicantes.reduce((grupos, practicante) => {

                const empresa =
                    practicante.empresa || "Sin empresa";

                if (!grupos[empresa]) {
                    grupos[empresa] = [];
                }

                grupos[empresa].push(practicante);

                return grupos;

            }, {}),
        [practicantes]
    );

    const practicantesSeleccionados =
        practicantes.filter((p) =>
            seleccionados.includes(p.id)
        );

    const empresaSeleccionada =
        practicantesSeleccionados[0]?.empresa || null;

    const handleToggle = (practicante) => {

        const { id, empresa } = practicante;

        if (idsConSolicitud.has(id)) {
            return;
        }

        if (seleccionados.includes(id)) {

            setSeleccionados((prev) =>
                prev.filter((x) => x !== id)
            );

            return;
        }

        if (
            empresaSeleccionada &&
            empresaSeleccionada !== empresa
        ) {

            toast.error(
                "Solo puede seleccionar practicantes de una empresa por solicitud."
            );

            return;
        }

        setSeleccionados((prev) => [
            ...prev,
            id
        ]);
    };

    const handleContinuar = () => {

        if (seleccionados.length === 0) {

            toast.error(
                "Seleccione al menos un practicante."
            );

            return;
        }

        setPaso(2);
    };

    const agregarFecha = () => {

        const ultimaFecha =
            fechas[fechas.length - 1];

        if (
            !ultimaFecha.fecha_inicio ||
            !ultimaFecha.fecha_fin ||
            !ultimaFecha.hora_inicio ||
            !ultimaFecha.hora_fin
        ) {

            toast.error(
                "Complete la disponibilidad actual antes de agregar otra."
            );

            return;
        }

        if (
            ultimaFecha.fecha_inicio >
            ultimaFecha.fecha_fin
        ) {

            toast.error(
                "La fecha inicial no puede ser posterior a la fecha final."
            );

            return;
        }

        if (
            ultimaFecha.hora_inicio >=
            ultimaFecha.hora_fin
        ) {

            toast.error(
                "La hora inicial debe ser anterior a la hora final."
            );

            return;
        }

        setFechas((prev) => [
            ...prev,
            { ...FECHA_VACIA }
        ]);

    };

    const eliminarFecha = (index) => {

        setFechas((prev) =>
            prev.filter((_, i) => i !== index)
        );

    };

    const actualizarFecha = (
        index,
        campo,
        valor
    ) => {

        setFechas((prev) =>
            prev.map((f, i) =>
                i === index
                    ? {
                        ...f,
                        [campo]: valor
                    }
                    : f
            )
        );

    };

    const handleEnviar = async () => {

        const fechasValidas = fechas.every(
            (f) =>
                f.fecha_inicio &&
                f.fecha_fin &&
                f.hora_inicio &&
                f.hora_fin
        );

        if (!fechasValidas) {

            toast.error(
                "Complete las fechas y horarios de todas las disponibilidades."
            );

            return;
        }

        const rangosValidos = fechas.every((f) => {

            return (
                f.fecha_inicio <= f.fecha_fin &&
                f.hora_inicio < f.hora_fin
            );

        });

        if (!rangosValidos) {

            toast.error(
                "Verifique que los rangos de fechas y horarios sean válidos."
            );

            return;
        }

        await onSubmit({
            practicantes: seleccionados,
            fechas
        });

    };

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* HEADER */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">

                    <div>

                        <h2 className="text-xl font-bold text-slate-800">
                            Solicitar visita
                        </h2>

                        <p className="text-sm text-slate-500">

                            {paso === 1
                                ? "Seleccione los practicantes de una empresa"
                                : empresaSeleccionada}

                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* BODY */}
                <div className="px-6 py-5 overflow-y-auto flex-1">

                    {/* PASO 1 */}
                    {paso === 1 && (

                        <div className="space-y-6">

                            {Object.entries(
                                empresasAgrupadas
                            ).map(
                                ([
                                    empresa,
                                    practicantesEmpresa
                                ]) => (

                                    <div
                                        key={empresa}
                                        className="border border-slate-200 rounded-xl overflow-hidden"
                                    >

                                        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">

                                            <p className="font-semibold text-slate-700">
                                                {empresa}
                                            </p>

                                        </div>

                                        <div className="divide-y divide-slate-100">

                                            {practicantesEmpresa.map(
                                                (practicante) => {

                                                    const seleccionado =
                                                        seleccionados.includes(
                                                            practicante.id
                                                        );

                                                    const tieneSolicitud =
                                                        idsConSolicitud.has(
                                                            practicante.id
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                practicante.id
                                                            }
                                                            onClick={() =>
                                                                handleToggle(
                                                                    practicante
                                                                )
                                                            }
                                                            className={`px-4 py-3 flex items-center gap-3 transition-colors ${tieneSolicitud
                                                                ? "bg-slate-50 opacity-60 cursor-not-allowed"
                                                                : "hover:bg-slate-50 cursor-pointer"
                                                                }`}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    seleccionado
                                                                }
                                                                disabled={
                                                                    tieneSolicitud
                                                                }
                                                                onChange={() =>
                                                                    handleToggle(
                                                                        practicante
                                                                    )
                                                                }
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                                className="w-4 h-4 accent-red-600"
                                                            />

                                                            <div className="flex-1 min-w-0">

                                                                <div className="flex items-center justify-between gap-3">

                                                                    <p className="text-sm font-medium text-slate-700">

                                                                        {practicante.practicante ||
                                                                            "Practicante"}

                                                                    </p>

                                                                    {practicante.estado && (

                                                                        <EstadoBadge
                                                                            estado={
                                                                                practicante.estado
                                                                            }
                                                                        />

                                                                    )}

                                                                </div>

                                                                {practicante.codigo && (

                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        Código:{" "}
                                                                        {
                                                                            practicante.codigo
                                                                        }
                                                                    </p>

                                                                )}

                                                                {tieneSolicitud && (

                                                                    <p className="text-xs text-amber-600 mt-1">
                                                                        Ya tiene una solicitud de visita.
                                                                    </p>

                                                                )}

                                                            </div>

                                                        </div>
                                                    );

                                                }
                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    )}

                    {/* PASO 2 */}
                    {paso === 2 && (

                        <>

                            {/* PRACTICANTES SELECCIONADOS */}
                            <p className="text-sm font-semibold text-slate-700 mb-3">
                                Practicantes seleccionados
                            </p>

                            <div className="space-y-2 mb-6">

                                {practicantesSeleccionados.map(
                                    (practicante) => (

                                        <div
                                            key={practicante.id}
                                            className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3"
                                        >

                                            <div>

                                                <p className="text-sm font-medium text-slate-700">
                                                    {practicante.practicante ||
                                                        "Practicante"}
                                                </p>

                                                {practicante.codigo && (

                                                    <p className="text-xs text-slate-500">
                                                        Código:{" "}
                                                        {
                                                            practicante.codigo
                                                        }
                                                    </p>

                                                )}

                                            </div>

                                            {practicante.estado && (

                                                <EstadoBadge
                                                    estado={
                                                        practicante.estado
                                                    }
                                                />

                                            )}

                                        </div>

                                    )
                                )}

                            </div>

                            {/* DISPONIBILIDADES */}
                            <div className="flex justify-between items-center mb-3">

                                <div>

                                    <p className="text-sm font-semibold text-slate-700">
                                        Disponibilidades propuestas
                                    </p>

                                    <p className="text-xs text-slate-500 mt-1">
                                        Indique los días y horarios en los que puede realizarse la visita.
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={agregarFecha}
                                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Plus size={16} />
                                    Agregar disponibilidad
                                </button>

                            </div>

                            <div className="space-y-4">

                                {fechas.map(
                                    (fecha, index) => (

                                        <div
                                            key={index}
                                            className="border border-slate-200 rounded-xl p-4"
                                        >

                                            {/* CABECERA */}
                                            <div className="flex justify-between items-center mb-4">

                                                <div>

                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Disponibilidad{" "}
                                                        {index + 1}
                                                    </p>

                                                </div>

                                                {fechas.length > 1 && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            eliminarFecha(
                                                                index
                                                            )
                                                        }
                                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>

                                                )}

                                            </div>

                                            {/* RANGO DE FECHAS */}
                                            <div className="space-y-4">

                                                <div>

                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                        Rango de fechas
                                                    </p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        {/* FECHA INICIAL */}
                                                        <div>

                                                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                Fecha inicial
                                                            </label>

                                                            <input
                                                                type="date"
                                                                min="1900-01-01"
                                                                max="2099-12-31"
                                                                value={fecha.fecha_inicio}
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "fecha_inicio",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                                                            />

                                                        </div>

                                                        {/* FECHA FINAL */}
                                                        <div>

                                                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                Fecha final
                                                            </label>

                                                            <input
                                                                type="date"
                                                                value={fecha.fecha_fin}
                                                                min={fecha.fecha_inicio || undefined}
                                                                max="2099-12-31"
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "fecha_fin",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                                                            />

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* HORARIO */}
                                                <div>

                                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                                        Horario disponible
                                                    </p>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                        {/* HORA INICIAL */}
                                                        <div>

                                                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                Hora inicial
                                                            </label>

                                                            <input
                                                                type="time"
                                                                value={
                                                                    fecha.hora_inicio
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "hora_inicio",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                                                            />

                                                        </div>

                                                        {/* HORA FINAL */}
                                                        <div>

                                                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                                                Hora final
                                                            </label>

                                                            <input
                                                                type="time"
                                                                value={
                                                                    fecha.hora_fin
                                                                }
                                                                min={
                                                                    fecha.hora_inicio ||
                                                                    undefined
                                                                }
                                                                onChange={(e) =>
                                                                    actualizarFecha(
                                                                        index,
                                                                        "hora_fin",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                                                            />

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </>

                    )}

                </div>

                {/* FOOTER */}
                <div className="flex justify-between items-center px-6 py-4 border-t border-slate-200">

                    {paso === 2 ? (

                        <button
                            type="button"
                            onClick={() => setPaso(1)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Atrás
                        </button>

                    ) : (

                        <p className="text-sm text-slate-500">
                            {seleccionados.length} seleccionado(s)
                        </p>

                    )}

                    <div className="flex items-center gap-3">

                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            Cancelar
                        </button>

                        {paso === 1 ? (

                            <button
                                type="button"
                                onClick={handleContinuar}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <CalendarDays size={16} />
                                Continuar
                            </button>

                        ) : (

                            <button
                                type="button"
                                onClick={handleEnviar}
                                disabled={enviando}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                <Send size={16} />

                                {enviando
                                    ? "Enviando..."
                                    : "Enviar solicitud"}

                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>
    );
};

export default SolicitudVisitaModal;
