export default function VacantesSkeleton({ filas = 6 }) {
  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      aria-busy="true"
      aria-label="Cargando vacantes"
    >
      {/* ENCABEZADO */}
      <div className="grid grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-3 w-20 animate-pulse rounded bg-slate-200"
          />
        ))}
      </div>

      {/* FILAS */}
      {Array.from({ length: filas }).map((_, fila) => (
        <div
          key={fila}
          className="grid grid-cols-5 items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
        >
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="flex items-center justify-center gap-2">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}