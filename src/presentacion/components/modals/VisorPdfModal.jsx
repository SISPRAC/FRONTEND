import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

// Modal reutilizable para ver un PDF sin salir de la página.
// - url: blob: (archivo recién seleccionado) o URL remota (documento ya subido)
// - pie: contenido opcional debajo del visor (botones de confirmación, etc.)
export default function VisorPdfModal({
    url,
    titulo = "Vista previa",
    subtitulo = "",
    onClose,
    bloqueado = false,
    pie = null,
}) {

    const [src, setSrc] = useState(null);
    const [cargando, setCargando] = useState(false);


    // Las URLs remotas se traen como blob para que el navegador
    // las muestre aunque el servidor las marque como "descarga".
    useEffect(() => {

        if (!url) {
            setSrc(null);
            return;
        }

        if (url.startsWith("blob:")) {
            setSrc(url);
            return;
        }

        let cancelado = false;
        let objectUrl = null;

        setCargando(true);

        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error("No se pudo cargar el PDF");
                return r.blob();
            })
            .then((blob) => {
                if (cancelado) return;
                objectUrl = URL.createObjectURL(
                    new Blob([blob], { type: "application/pdf" })
                );
                setSrc(objectUrl);
            })
            .catch(() => {
                // Si el servidor no permite CORS, se intenta directo
                if (!cancelado) setSrc(url);
            })
            .finally(() => {
                if (!cancelado) setCargando(false);
            });

        return () => {
            cancelado = true;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };

    }, [url]);


    // Cerrar con Escape
    useEffect(() => {

        const onKey = (e) => {
            if (e.key === "Escape" && !bloqueado) onClose();
        };

        window.addEventListener("keydown", onKey);

        return () => window.removeEventListener("keydown", onKey);

    }, [onClose, bloqueado]);


    return (

        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
        >

            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">

                {/* Encabezado */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">

                    <div className="min-w-0">

                        <h3 className="text-base font-extrabold text-slate-800 truncate">
                            {titulo}
                        </h3>

                        {subtitulo && (
                            <p className="text-xs text-slate-500 truncate">
                                {subtitulo}
                            </p>
                        )}

                    </div>

                    <button
                        onClick={onClose}
                        disabled={bloqueado}
                        className="text-slate-400 hover:text-red-600 disabled:opacity-50"
                        title="Cerrar"
                    >
                        <X size={18} />
                    </button>

                </div>


                {/* Visor */}
                <div className="flex-1 min-h-0 bg-slate-100 relative">

                    {cargando && (

                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 size={28} className="animate-spin text-slate-400" />
                        </div>

                    )}

                    {src && (

                        <iframe
                            src={src}
                            title={titulo}
                            className="w-full h-full"
                        />

                    )}

                </div>


                {/* Pie opcional */}
                {pie}

            </div>

        </div>

    );

}