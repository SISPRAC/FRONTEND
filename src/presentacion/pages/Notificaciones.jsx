import { useCallback, useEffect, useMemo, useState } from "react";

// Casos de uso
import { marcarTodasNotificacionesLeidas } from "../../aplicacion/notificacion/marcarTodasNotificacionesLeidas.js";
import { marcarNotificacionLeida } from "../../aplicacion/notificacion/marcarNotificacionLeida.js";
import { obtenerNotificaciones } from "../../aplicacion/notificacion/obtenerNotificaciones.js";
import toast from "react-hot-toast";
// Repositorio
import { notificacionRepository } from "../../infraestructura/repository/notificacionRepository.js";

// Los casos de uso esperan un objeto con { notificacionRepository }
const dependencias = { notificacionRepository };

const POR_PAGINA = 6;

const FILTROS = {
    LEIDAS: "leidas",
    NO_LEIDAS: "no-leidas",
};

// Formatear fecha y hora de la notificación
const formatearFecha = (fecha) => {
    if (!fecha) return "";

    const fechaObj = new Date(String(fecha).replace(" ", "T"));

    if (isNaN(fechaObj.getTime())) return fecha;

    return fechaObj.toLocaleString("es-CO", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
};

const normalizarNotificacion = (notificacion) => ({
    ...notificacion,
    leida: String(notificacion.estado).toUpperCase() === "LEIDA",
});

// Todo lo que venga entre comillas ("así", “así” o «así») sale en negrilla y más grande
const resaltarComillas = (texto) => {
    if (!texto) return texto;

    return String(texto)
        .split(/("[^"]+"|“[^”]+”|«[^»]+»)/g)
        .map((parte, i) =>
            i % 2 === 1 ? (
                <strong
                    key={i}
                    className="text-base font-bold text-neutral-900"
                >
                    {parte}
                </strong>
            ) : (
                parte
            )
        );
};

export default function NotificacionesView() {
    // Siempre se guardan TODAS; el filtro se aplica en pantalla.
    // Así los contadores (total / sin leer) nunca dependen del filtro activo.
    const [notificaciones, setNotificaciones] = useState([]);
    const [filtro, setFiltro] = useState(FILTROS.NO_LEIDAS);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);
    const [idEnProceso, setIdEnProceso] = useState(null);
    const [pagina, setPagina] = useState(1);

    const total = notificaciones.length;

    const leidasCount = useMemo(
        () => notificaciones.filter((n) => n.leida).length,
        [notificaciones]
    );

    const noLeidasCount = useMemo(
        () => notificaciones.filter((n) => !n.leida).length,
        [notificaciones]
    );

    const visibles = useMemo(
        () =>
            filtro === FILTROS.LEIDAS
                ? notificaciones.filter((n) => n.leida)
                : notificaciones.filter((n) => !n.leida),
        [notificaciones, filtro]
    );

    // Paginado (si al marcar como leídas se acorta la lista, la página se ajusta sola)
    const totalPaginas = Math.max(1, Math.ceil(visibles.length / POR_PAGINA));
    const paginaActual = Math.min(pagina, totalPaginas);
    const paginadas = useMemo(
        () =>
            visibles.slice(
                (paginaActual - 1) * POR_PAGINA,
                paginaActual * POR_PAGINA
            ),
        [visibles, paginaActual]
    );

    const cargarNotificaciones = useCallback(async () => {
        setCargando(true);
        setError(null);

        try {
            const data = await obtenerNotificaciones(dependencias);

            setNotificaciones((data ?? []).map(normalizarNotificacion));
        } catch (err) {
            setError(
                err?.message || "No se pudieron cargar las notificaciones"
            );
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => {
        cargarNotificaciones();
    }, [cargarNotificaciones]);

    const handleMarcarLeida = async (id) => {
        setIdEnProceso(id);

        try {
            await marcarNotificacionLeida(dependencias, id);

            setNotificaciones((prev) =>
                prev.map((n) =>
                    n.id === id
                        ? { ...n, leida: true, estado: "LEIDA" }
                        : n
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
        if (noLeidasCount === 0) {
            toast.error("No tienes notificaciones pendientes por leer");
            return;
        }

        setMarcandoTodas(true);

        try {
            await marcarTodasNotificacionesLeidas(dependencias);

            setNotificaciones((prev) =>
                prev.map((n) => ({ ...n, leida: true, estado: "LEIDA" }))
            );

            toast.success("Todas las notificaciones fueron marcadas como leídas");
        } catch (err) {
            setError(
                err?.message || "No se pudieron marcar todas como leídas"
            );
        } finally {
            setMarcandoTodas(false);
        }
    };

    const tabs = [
        { key: FILTROS.NO_LEIDAS, label: "Sin leer", count: noLeidasCount },
        { key: FILTROS.LEIDAS, label: "Leídas", count: leidasCount },
    ];

    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-6">
            {/* Encabezado */}
            <div className="mb-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-semibold text-neutral-900">
                            Notificaciones
                        </h1>

                        <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
                            <span>
                                Sin leer{" "}
                                <strong
                                    className={`text-base ${noLeidasCount > 0
                                        ? "text-red-600"
                                        : "text-neutral-900"
                                        }`}
                                >
                                    {noLeidasCount}
                                </strong>
                            </span>

                            <span className="text-neutral-300">|</span>

                            <span>
                                Total{" "}
                                <strong className="text-base text-neutral-900">
                                    {total}
                                </strong>
                            </span>
                        </div>
                    </div>

                    {/* Siempre visible; se desactiva si no hay nada por leer */}
                    <button
                        type="button"
                        onClick={handleMarcarTodas}
                        disabled={marcandoTodas}
                        className="shrink-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
                    >
                        {marcandoTodas ? "Marcando..." : "Leer todas"}
                    </button>
                </div>
            </div>

            {/* Tabs de filtro con su contador */}
            <div className="mb-4 flex gap-4 border-b border-neutral-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                            setFiltro(tab.key);
                            setPagina(1);
                        }}
                        className={`-mb-px flex items-center gap-2 border-b-2 pb-2 text-sm font-medium transition-colors ${filtro === tab.key
                            ? "border-neutral-900 text-neutral-900"
                            : "border-transparent text-neutral-400 hover:text-neutral-600"
                            }`}
                    >
                        {tab.label}
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs ${filtro === tab.key
                                ? "bg-neutral-900 text-white"
                                : "bg-neutral-100 text-neutral-500"
                                }`}
                        >
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={cargarNotificaciones}
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
            ) : visibles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-200 px-4 py-10 text-center">
                    <p className="text-sm font-medium text-neutral-700">
                        {filtro === FILTROS.NO_LEIDAS
                            ? "No tienes notificaciones sin leer"
                            : "No tienes notificaciones leídas"}
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                        Aquí aparecerán las novedades relacionadas con tus
                        tutorías.
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {paginadas.map((n) => (
                        <li key={n.id}>
                            <button
                                type="button"
                                onClick={() =>
                                    !n.leida && handleMarcarLeida(n.id)
                                }
                                disabled={idEnProceso === n.id}
                                className={`w-full rounded-lg border text-left transition-colors ${n.leida
                                    ? "cursor-default border-neutral-200 bg-white"
                                    : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
                                    } ${idEnProceso === n.id ? "opacity-60" : ""}`}
                            >
                                <div className="flex items-start gap-3 px-4 py-3">
                                    {/* Punto rojo SOLO si no está leída */}
                                    <span className="mt-1.5 flex h-2 w-2 flex-shrink-0">
                                        {!n.leida && (
                                            <span
                                                className="h-2 w-2 rounded-full bg-red-600"
                                                aria-label="Sin leer"
                                            />
                                        )}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={`block text-sm ${n.leida
                                                ? "font-normal text-neutral-500"
                                                : "font-semibold text-neutral-900"
                                                }`}
                                        >
                                            {resaltarComillas(n.titulo)}
                                        </span>

                                        {n.descripcion && (
                                            <span className="mt-1 block whitespace-normal text-sm leading-5 text-neutral-600">
                                                {resaltarComillas(n.descripcion)}
                                            </span>
                                        )}
                                    </span>
                                </div>

                                {n.fecha_creacion && (
                                    <div className="border-t border-neutral-100 px-4 py-2 text-right">
                                        <span className="text-xs text-neutral-400">
                                            {formatearFecha(n.fecha_creacion)}
                                        </span>
                                    </div>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Paginado */}
            {!cargando && totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => setPagina(paginaActual - 1)}
                        disabled={paginaActual === 1}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
                    >
                        Anterior
                    </button>

                    <span className="text-sm text-neutral-500">
                        Página{" "}
                        <strong className="text-neutral-900">
                            {paginaActual}
                        </strong>{" "}
                        de {totalPaginas}
                    </span>

                    <button
                        type="button"
                        onClick={() => setPagina(paginaActual + 1)}
                        disabled={paginaActual === totalPaginas}
                        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-300 disabled:hover:bg-transparent"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
}