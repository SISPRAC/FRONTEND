import { useCallback, useEffect, useState } from "react";
import Layout from "../shared/Layouts/Layout";

// Casos de uso
import { marcarTodasNotificacionesLeidas } from "../../aplicacion/notificacion/marcarTodasNotificacionesLeidas.js";
import { marcarNotificacionLeida } from "../../aplicacion/notificacion/marcarNotificacionLeida.js";
import { obtenerNotificaciones } from "../../aplicacion/notificacion/obtenerNotificaciones.js";
import { obtenerNotificacionesNoLeidas } from "../../aplicacion/notificacion/obtenerNotificacionesNoLeidas.js";

// Repositorio
import { notificacionRepository } from "../../infraestructura/repository/notificacionRepository.js";

// Los casos de uso esperan un objeto con { notificacionRepository }
const dependencias = { notificacionRepository };

const FILTROS = {
    TODAS: "todas",
    NO_LEIDAS: "no-leidas",
};

// Formatear fecha y hora de la notificación
const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const fechaNormalizada = fecha.replace(" ", "T");

    const fechaObj = new Date(fechaNormalizada);

    if (isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
};

export default function NotificacionesView() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [filtro, setFiltro] = useState(FILTROS.TODAS);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);
    const [idEnProceso, setIdEnProceso] = useState(null);

    const noLeidasCount = notificaciones.filter((n) => !n.leida).length;

    const cargarNotificaciones = useCallback(async (filtroActual) => {
        setCargando(true);
        setError(null);

        try {
            const data =
                filtroActual === FILTROS.NO_LEIDAS
                    ? await obtenerNotificacionesNoLeidas(dependencias)
                    : await obtenerNotificaciones(dependencias);

            console.log("notificaciones", data);

            setNotificaciones(data ?? []);
        } catch (err) {
            setError(
                err?.message || "No se pudieron cargar las notificaciones"
            );
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarNotificaciones(filtro);
    }, [filtro, cargarNotificaciones]);

    const handleMarcarLeida = async (id) => {
        setIdEnProceso(id);

        try {
            await marcarNotificacionLeida(dependencias, id);

            setNotificaciones((prev) =>
                filtro === FILTROS.NO_LEIDAS
                    ? prev.filter((n) => n.id !== id)
                    : prev.map((n) =>
                        n.id === id ? { ...n, leida: true } : n
                    )
            );
        } catch (err) {
            setError(
                err?.message ||
                "No se pudo marcar la notificación como leída"
            );
        } finally {
            setIdEnProceso(null);
        }
    };

    const handleMarcarTodas = async () => {
        setMarcandoTodas(true);

        try {
            await marcarTodasNotificacionesLeidas(dependencias);

            setNotificaciones((prev) =>
                filtro === FILTROS.NO_LEIDAS
                    ? []
                    : prev.map((n) => ({ ...n, leida: true }))
            );
        } catch (err) {
            setError(
                err?.message || "No se pudieron marcar todas como leídas"
            );
        } finally {
            setMarcandoTodas(false);
        }
    };

    return (
        <Layout footerLabel="Tutor Docente">
            <div className="mx-auto w-full max-w-2xl px-4 py-6">
                {/* Encabezado */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-semibold text-neutral-900">
                            Notificaciones
                        </h1>

                        {noLeidasCount > 0 && (
                            <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-medium text-white">
                                {noLeidasCount}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleMarcarTodas}
                        disabled={
                            marcandoTodas || noLeidasCount === 0
                        }
                        className="text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 disabled:cursor-not-allowed disabled:text-neutral-300"
                    >
                        {marcandoTodas
                            ? "Marcando..."
                            : "Marcar todas como leídas"}
                    </button>
                </div>

                {/* Tabs de filtro */}
                <div className="mb-4 flex gap-4 border-b border-neutral-200">
                    {[
                        {
                            key: FILTROS.TODAS,
                            label: "Todas",
                        },
                        {
                            key: FILTROS.NO_LEIDAS,
                            label: "No leídas",
                        },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setFiltro(tab.key)}
                            className={`-mb-px border-b-2 pb-2 text-sm font-medium transition-colors ${filtro === tab.key
                                ? "border-neutral-900 text-neutral-900"
                                : "border-transparent text-neutral-400 hover:text-neutral-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() =>
                                cargarNotificaciones(filtro)
                            }
                            className="font-medium text-red-700 underline underline-offset-2 hover:text-red-800"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Contenido */}
                {cargando ? (
                    <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-20 animate-pulse rounded-lg bg-neutral-100"
                            />
                        ))}
                    </div>
                ) : notificaciones.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-neutral-200 px-4 py-10 text-center">
                        <p className="text-sm font-medium text-neutral-700">
                            {filtro === FILTROS.NO_LEIDAS
                                ? "No tienes notificaciones sin leer"
                                : "Aún no tienes notificaciones"}
                        </p>

                        <p className="mt-1 text-sm text-neutral-400">
                            Aquí aparecerán las novedades relacionadas con
                            tus tutorías.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {notificaciones.map((n) => (
                            <li key={n.id}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        !n.leida && handleMarcarLeida(n.id)
                                    }
                                    disabled={idEnProceso === n.id}
                                    className={`w-full rounded-lg border text-left transition-colors ${n.leida
                                        ? "border-neutral-200 bg-white hover:bg-neutral-50"
                                        : "border-amber-200 bg-amber-50 hover:bg-amber-100"
                                        } ${idEnProceso === n.id ? "opacity-60" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-3 px-4 py-3">
                                        {/* Indicador */}
                                        <span
                                            className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.leida
                                                ? "bg-neutral-300"
                                                : "bg-amber-500"
                                                }`}
                                            aria-hidden="true"
                                        />

                                        <span className="min-w-0 flex-1">
                                            {/* Título */}
                                            <span
                                                className={`block text-sm ${n.leida
                                                    ? "font-normal text-neutral-500"
                                                    : "font-semibold text-neutral-900"
                                                    }`}
                                            >
                                                {n.titulo}
                                            </span>

                                            {/* Descripción */}
                                            {n.descripcion && (
                                                <span className="mt-1 block whitespace-normal text-sm leading-5 text-neutral-600">
                                                    {n.descripcion}
                                                </span>
                                            )}
                                        </span>

                                        {/* Nueva */}
                                        {!n.leida && (
                                            <span className="mt-1 flex-shrink-0 text-xs font-medium text-amber-600">
                                                Nueva
                                            </span>
                                        )}
                                    </div>

                                    {/* Footer de fecha */}
                                    {n.fecha_creacion && (
                                        <div className="border-t border-neutral-100 px-4 py-2 text-right">
                                            <span className="text-xs text-neutral-400">
                                                {new Date(n.fecha_creacion).toLocaleString(
                                                    "es-CO",
                                                    {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        second: "2-digit",
                                                        hour12: true,
                                                    }
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            </li>
                        ))}


                    </ul>
                )}
            </div>
        </Layout>
    );
}

