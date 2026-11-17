const Bloque = ({ className = "" }) => (
  <div className={`bg-slate-200 rounded-md ${className}`} />
);

const GrupoPracticaDetalleSkeleton = () => (
  <div className="animate-pulse" aria-busy="true" aria-label="Cargando...">

    {/* HEADER (botón volver) */}
    <div className="relative flex items-center justify-center mb-8">
      <Bloque className="absolute left-0 h-9 w-24" />
    </div>

    {/* PERIODO / ESTADO */}
    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 max-w-5xl mx-auto">
      <div className="flex flex-col items-center md:items-start gap-2">
        <Bloque className="h-4 w-28" />
        <Bloque className="h-8 w-40" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Bloque className="h-4 w-16" />
        <Bloque className="h-8 w-28 rounded-full" />
      </div>
    </div>

    {/* TÍTULO PRACTICANTES */}
    <Bloque className="h-8 w-48 mx-auto mb-4" />

    {/* TABLA */}
    <div className="max-w-5xl mx-auto mb-12 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* encabezado */}
      <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bloque key={i} className="h-4 w-20" />
        ))}
      </div>

      {/* filas (pageSize = 3) */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-4 gap-4 items-center px-4 py-4 border-b border-slate-100 last:border-b-0"
        >
          <Bloque className="h-4 w-3/4" />
          <Bloque className="h-4 w-2/3" />
          <Bloque className="h-4 w-4/5" />
          <Bloque className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>

    {/* APERTURAS: título + botón */}
    <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">
      <Bloque className="h-8 w-56" />
      <Bloque className="h-8 w-24 rounded-lg" />
    </div>

    {/* TARJETAS */}
    <div className="max-w-5xl mx-auto mb-16 flex gap-5 overflow-hidden justify-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-[270px] border-2 border-slate-200 rounded-2xl p-5 bg-white space-y-3"
        >
          <Bloque className="h-5 w-3/4" />
          <Bloque className="h-4 w-1/2" />
          <Bloque className="h-4 w-1/3" />
          <Bloque className="h-5 w-24 rounded-full" />
          <Bloque className="h-4 w-2/3" />
          <div className="flex justify-end gap-2 pt-2">
            <Bloque className="h-7 w-7" />
            <Bloque className="h-7 w-7" />
          </div>
        </div>
      ))}
    </div>

  </div>
);

export default GrupoPracticaDetalleSkeleton;