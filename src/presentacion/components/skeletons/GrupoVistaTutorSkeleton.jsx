const GrupoVistaTutorSkeleton = () => {
    return (
        <div className="animate-pulse">

            {/* Botón volver */}
            <div className="flex items-center mb-8">
                <div className="h-10 w-24 rounded-md bg-slate-200" />
            </div>

            {/* Header: Periodo + Estado de la práctica */}
            <div className="flex justify-between items-start mb-6 px-1 gap-6">
                <div className="space-y-3">
                    <div className="h-3 w-28 rounded bg-slate-200" />
                    <div className="h-8 w-48 rounded-lg bg-slate-200" />
                </div>

                <div className="flex flex-col items-end space-y-3">
                    <div className="h-3 w-36 rounded bg-slate-200" />
                    <div className="h-8 w-28 rounded-full bg-slate-200" />
                </div>
            </div>

            {/* Fechas de la práctica */}
            <div className="flex justify-center gap-10 mb-6 px-1">
                {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col items-center space-y-3">
                        <div className="h-3 w-24 rounded bg-slate-200" />
                        <div className="h-6 w-28 rounded-lg bg-slate-200" />
                    </div>
                ))}
            </div>

            {/* Nombre del grupo */}
            <div className="flex justify-center mb-7">
                <div className="h-9 w-64 max-w-full rounded-lg bg-slate-200" />
            </div>

            {/* Tabla */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
                    {["w-16", "w-28", "w-24", "w-20"].map((width, index) => (
                        <div
                            key={index}
                            className={`h-4 ${width} rounded bg-slate-200`}
                        />
                    ))}
                </div>

                {[1, 2, 3, 4].map((fila) => (
                    <div
                        key={fila}
                        className="grid grid-cols-4 items-center gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0"
                    >
                        <div className="h-4 w-20 rounded bg-slate-200" />
                        <div className="h-4 w-32 max-w-full rounded bg-slate-200" />
                        <div className="h-4 w-28 max-w-full rounded bg-slate-200" />
                        <div className="h-6 w-20 rounded-full bg-slate-200" />
                    </div>
                ))}
            </div>

            {/* Botón solicitar visita */}
            <div className="flex justify-end mt-4">
                <div className="h-10 w-40 rounded-lg bg-slate-200" />
            </div>

            {/* Indicador de carga */}
            <div className="mt-6 flex items-center justify-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                <p className="text-sm font-medium text-slate-500">
                    Cargando información del grupo...
                </p>
            </div>

        </div>
    );
};

export default GrupoVistaTutorSkeleton;