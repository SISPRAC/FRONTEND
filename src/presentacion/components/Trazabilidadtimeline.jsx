import {
    UploadCloud,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
} from "lucide-react";


// ---------------------------------------------------------------
// Trazabilidad (componente compartido, solo lectura)
// ---------------------------------------------------------------

const config = {

    CARGADO: {
        color: "bg-blue-500",
        icon: <UploadCloud size={15} className="text-white" />,
    },

    ACTUALIZADO: {
        color: "bg-blue-500",
        icon: <UploadCloud size={15} className="text-white" />,
    },

    PENDIENTE: {
        color: "bg-orange-400",
        icon: <Clock size={15} className="text-white" />,
    },

    APROBADO: {
        color: "bg-emerald-500",
        icon: <CheckCircle2 size={15} className="text-white" />,
    },

    RECHAZADO: {
        color: "bg-red-500",
        icon: <XCircle size={15} className="text-white" />,
    },

    OBSERVACION: {
        color: "bg-slate-400",
        icon: <FileText size={15} className="text-white" />,
    },

    COMENTADO: {
        color: "bg-slate-400",
        icon: <FileText size={15} className="text-white" />,
    },

    VENCIDO: {
        color: "bg-slate-500",
        icon: <Clock size={15} className="text-white" />,
    },

};


const formatearFecha = (fecha) => {

    if (!fecha) return "";

    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
        return fecha;
    }

    return date.toLocaleString("es-CO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

};


export default function TrazabilidadTimeline({ eventos = [] }) {

    const eventosOrdenados = [...eventos].sort(
        (a, b) =>
            new Date(a.fecha).getTime() -
            new Date(b.fecha).getTime()
    );


    return (

        <div className="trazabilidad-scroll h-full overflow-y-auto pr-2">

            {/* Ocultar la barra de scroll */}
            <style>{`
                .trazabilidad-scroll::-webkit-scrollbar {
                    width: 0px;
                    height: 0px;
                    display: none;
                }

                .trazabilidad-scroll {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>


            {eventosOrdenados.length === 0 ? (

                <div className="h-full flex items-center justify-center">

                    <p className="text-slate-400 text-sm">
                        Sin movimientos aún
                    </p>

                </div>

            ) : (

                <div className="relative pl-1">

                    {eventosOrdenados.map((ev, i) => {

                        const c =
                            config[ev.accion] ||
                            config.OBSERVACION;

                        const esUltimo =
                            i === eventosOrdenados.length - 1;


                        return (

                            <div
                                key={ev.id ?? i}
                                className="relative flex gap-3 pb-5 last:pb-0"
                            >

                                {!esUltimo && (

                                    <div
                                        className="absolute left-[14px] top-[28px] bottom-0 w-[2px] bg-slate-200"
                                    />

                                )}


                                <div
                                    className={`relative z-10 w-[28px] h-[28px] rounded-full ${c.color} flex items-center justify-center shrink-0 shadow-sm`}
                                >
                                    {c.icon}
                                </div>


                                <div className="flex-1 min-w-0 pt-0.5">

                                    <div className="flex items-start justify-between gap-3">

                                        <p className="text-xs font-bold text-slate-800 leading-tight">
                                            {ev.accion}
                                        </p>

                                        <p className="text-[10px] text-slate-400 whitespace-nowrap">
                                            {formatearFecha(ev.fecha)}
                                        </p>

                                    </div>


                                    {ev.comentario && (

                                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                                            {ev.comentario}
                                        </p>

                                    )}

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}