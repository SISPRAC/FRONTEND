const ConfirmModal = ({
    isOpen,
    title,
    message,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    confirmColor = "bg-green-600 hover:bg-green-700",
    onConfirm,
    onCancel,

    showTextarea = false,
    textareaValue = "",
    onTextareaChange,
    textareaPlaceholder = "Escriba el motivo del rechazo..."
}) => {

    if (!isOpen) return null;

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
                            onChange={(e) => onTextareaChange(e.target.value)}
                            placeholder={textareaPlaceholder}
                            rows={4}
                            className="
                                w-full
                                resize-none
                                rounded-lg
                                border
                                border-slate-300
                                px-3
                                py-2
                                text-sm
                                text-slate-700
                                placeholder:text-slate-400
                                outline-none
                                focus:border-red-400
                                focus:ring-2
                                focus:ring-red-100
                            "
                        />
                    </div>
                )}

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onCancel}
                        className="
                            px-4
                            py-2
                            rounded-md
                            text-sm
                            font-medium
                            text-slate-600
                            border
                            border-slate-300
                            hover:bg-slate-100
                        "
                    >
                        {cancelLabel}
                    </button>

                    <button
                        onClick={onConfirm}
                        className={`
                            px-4
                            py-2
                            rounded-md
                            text-sm
                            font-semibold
                            text-white
                            ${confirmColor}
                        `}
                    >
                        {confirmLabel}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default ConfirmModal;