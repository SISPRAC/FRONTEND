import { ClipboardList, Eye, X, CheckCircle2, Clock3 } from "lucide-react";

const EncuestasPracticanteDirectorModal = ({
  mostrar,
  practicante,
  practicas = [],
  onCerrar,
  onVerDetalle,
}) => {

  if (!mostrar) return null;
  console.log("Encuesta al entrar ", practicas);

  const encuestasDisponibles = practicas.flatMap((practica) =>
    (practica.encuestas || []).map((encuesta) => ({
      ...encuesta,
      practica_id: practica.practica_id,
      estadoPractica: practica.estadoPractica,
    }))
  );
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <ClipboardList size={23} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Encuestas del practicante
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {practicante?.nombre || "Practicante"}
                {practicante?.codigo ? ` · ${practicante.codigo}` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto px-6 py-5">
          {encuestasDisponibles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ClipboardList size={38} className="mb-3 text-slate-300" />

              <p className="font-semibold text-slate-700">
                No hay encuestas asignadas
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Este practicante no tiene encuestas en sus prácticas en curso o finalizadas.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {practicas.map((practica, index) => {
                const encuestas = practica.encuestas || [];

                if (encuestas.length === 0) return null;

                return (
                  <section
                    key={practica.practica_practicante_id ?? `${practica.practica_id}-${index}`}
                    className="space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-slate-800">
                        Práctica {practica.practica_id}
                      </h3>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {practica.estadoPractica}
                      </span>
                    </div>

                    {encuestas.map((encuesta) => (
                      <div
                        key={encuesta.id}
                        className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              encuesta.respondida
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {encuesta.respondida ? (
                              <CheckCircle2 size={19} />
                            ) : (
                              <Clock3 size={19} />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800">
                              {encuesta.plantilla?.titulo ||
                                encuesta.titulo ||
                                "Encuesta sin título"}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {encuesta.respondida
                                ? "Encuesta respondida"
                                : "Pendiente por responder"}
                            </p>

                            {encuesta.fechaRespuesta && (
                              <p className="mt-1 text-xs text-slate-400">
                                Respondida el{" "}
                                {new Date(
                                  encuesta.fechaRespuesta
                                ).toLocaleDateString("es-CO")}
                              </p>
                            )}
                          </div>
                        </div>

                        {encuesta.respondida ? (
                          <button
                            type="button"
                            onClick={() => onVerDetalle(encuesta)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                          >
                            <Eye size={17} />
                            Ver respuestas
                          </button>
                        ) : (
                          <span className="inline-flex shrink-0 items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                            Sin respuestas
                          </span>
                        )}
                      </div>
                    ))}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EncuestasPracticanteDirectorModal;