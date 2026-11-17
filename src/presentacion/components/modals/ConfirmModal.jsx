
import { LoaderCircle } from "lucide-react";

const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    confirmColor = "bg-red-600 hover:bg-red-700",
    onConfirm,
    onCancel,
    loading = false,

    showTextarea = false,
    textareaValue = "",
    onTextareaChange,
    textareaPlaceholder = "Escriba el motivo del rechazo...",
    maxWords = null
}) => {

    if (!isOpen) return null;

    const contarPalabras = (texto) => {
        return texto.trim() ? texto.trim().split(/\s+/).length : 0;
    };

    const palabras = contarPalabras(textareaValue);

    const handleTextareaChange = (valor) => {
        if (maxWords !== null && contarPalabras(valor) > maxWords) {
            return;
        }

        onTextareaChange?.(valor);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">

                <h2 className="text-lg font-bold text-slate-800 mb-2">
                    {title}
                </h2>

                <p className="text-sm text-slate-600 mb-5">
                    {message}
                </p>

                {showTextarea && (
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Motivo del rechazo
                        </label>

                        <textarea
                            value={textareaValue}
                            onChange={(e) => handleTextareaChange(e.target.value)}
                            placeholder={textareaPlaceholder}
                            rows={4}
                            disabled={loading}
                            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-slate-100"
                        />

                        {maxWords !== null && (
                            <p className={`text-xs text-right mt-1 ${
                                palabras >= maxWords
                                    ? "text-red-500 font-semibold"
                                    : "text-slate-400"
                            }`}>
                                {palabras} / {maxWords} palabras
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-md text-sm font-medium text-slate-600 border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`
                            px-4 py-2 rounded-md text-sm font-semibold
                            text-white transition-colors
                            disabled:opacity-60 disabled:cursor-not-allowed
                            flex items-center justify-center gap-2
                            ${confirmColor}
                        `}
                    >
                        {loading ? (
                            <>
                                <LoaderCircle size={16} className="animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;
