import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    Users,
    ClipboardCheck,
    MapPin,
    Briefcase,
    ArrowLeft,
    FileText,
    ChevronDown
} from "lucide-react";

import EstadoBadge from "../../components/estadoBadge/EstadoBadge.jsx";
import ConfirmModal from "../../components/modals/ConfirmModal";
import SolicitudesVisitaModal2 from "../../components/modals/SolicitudvisitaModalDocente.jsx";
import SeleccionarFechaVisitaModal from "../../components/modals/SeleccionarFechaVisitaModal";

import { tutorEmpresarialRepository } from "../../../infraestructura/repository/tutorEmpresarialRepository.js";
import { solicitudVisitaRepository } from "../../../infraestructura/repository/solicitudVisitaRepository.js";
import { visitaRepository } from "../../../infraestructura/repository/visitaRepository.js";

import { getAperturasByPractica } from "../../../aplicacion/tutorEmpresarial/getAperturasByPractica.js";
import { obtenerSolicitudesVisitaPorPractica } from "../../../aplicacion/solicitudVisita/obtenerSolicitudesVisitaPorPractica.js";
import { obtenerVisitaPorSolicitud } from "../../../aplicacion/visita/obtenerVisitaPorSolicitud.js";

import { aceptarSolicitudVisita } from "../../../aplicacion/solicitudVisita/aceptarSolicitudVisita.js";
import { rechazarSolicitudVisita } from "../../../aplicacion/solicitudVisita/rechazarSolicitudVisita.js";


// ------------------------------------------------------------
// Tarjeta de apertura
// ------------------------------------------------------------

const AperturaCard = ({ apertura, expandido, onToggle, navigate }) => {
    const practicantes = apertura.practicantes || [];
    const cantidad = practicantes.length;

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-800 truncate">
                        {apertura.nombreVacante || "Vacante"}
                    </h2>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <Briefcase size={15} />
                            Cupos: {apertura.cupos}
                        </span>

                        <span className="flex items-center gap-1.5">
                            <Users size={15} />
                            {cantidad}{" "}
                            {cantidad === 1 ? "practicante" : "practicantes"}
                        </span>

                        <EstadoBadge estado={apertura.estado} />
                    </div>
                </div>

                <ChevronDown
                    size={20}
                    className={`shrink-0 text-gray-500 mt-1 transition-transform ${expandido ? "rotate-180" : ""
                        }`}
                />
            </button>

            {expandido && (
                <div className="p-4 border-t">

                    {cantidad === 0 && (
                        <p className="text-sm text-gray-500">
                            No hay practicantes asociados a esta apertura.
                        </p>
                    )}

                    <div
                        className={`grid gap-3 ${cantidad > 1
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1"
                            }`}
                    >
                        {practicantes.map((p) => (
                            <div
                                key={p.id_practicante}
                                className="relative border rounded-lg p-3 pr-24 hover:border-gray-300 transition-colors"
                            >
                                <div className="absolute top-3 right-3">
                                    <EstadoBadge estado={p.estado} size="sm" />
                                </div>

                                <h4 className="font-semibold text-gray-800 text-sm pr-2">
                                    {p.nombre || "Practicante"}
                                </h4>

                                <p className="text-xs text-gray-500 mt-1.5">
                                    {p.correo || "Correo no registrado"}
                                    {" · "}
                                    {p.telefono || "Teléfono no registrado"}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/informes/${p.id_practicante}`,
                                                {
                                                    state: {
                                                        practicante: {
                                                            id: p.id_practicante,
                                                            nombre: p.nombre,
                                                            correo: p.correo,
                                                            telefono: p.telefono,
                                                            estado: p.estado
                                                        }
                                                    }
                                                }
                                            )
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <FileText size={15} />
                                        Informes
                                    </button>

                                    <button
                                        onClick={() =>
                                            console.log(
                                                "Encuestas:",
                                                p.id_practicante
                                            )
                                        }
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <ClipboardCheck size={15} />
                                        Encuestas
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// ------------------------------------------------------------
// Vista
// ------------------------------------------------------------

const MisAperturasTutorEmpresarial = () => {
    const { practicaId } = useParams();
    const navigate = useNavigate();

    // Aperturas
    const [aperturas, setAperturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandido, setExpandido] = useState({});

    // Solicitudes de visita
    const [solicitudesVisita, setSolicitudesVisita] = useState([]);
    const [mostrarModalVisitas, setMostrarModalVisitas] = useState(false);
    const [loadingVisitas, setLoadingVisitas] = useState(false);

    // Aceptar: primero se elige la fecha, luego se confirma
    const [solicitudSeleccionFecha, setSolicitudSeleccionFecha] = useState(null);
    const [visitaPendiente, setVisitaPendiente] = useState(null);

    // Rechazar
    const [solicitudRechazar, setSolicitudRechazar] = useState(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");

    const [procesando, setProcesando] = useState(false);

    // Visita seleccionada
    const [visitaSeleccionada, setVisitaSeleccionada] = useState(null);
    const [mostrarModalVisita, setMostrarModalVisita] = useState(false);
    const [loadingVisita, setLoadingVisita] = useState(false);


    // ---------------- Cargar aperturas ----------------

    useEffect(() => {
        if (!practicaId) {
            setLoading(false);
            return;
        }

        const cargar = async () => {
            try {
                setLoading(true);

                const data = await getAperturasByPractica(
                    { tutorEmpresarialRepository },
                    practicaId
                );

                setAperturas(data || []);
            } catch (error) {
                console.error("Error cargando las aperturas:", error);
                toast.error("No se pudieron cargar las aperturas");
                setAperturas([]);
            } finally {
                setLoading(false);
            }
        };

        cargar();
    }, [practicaId]);


    // ---------------- Solicitudes de visita ----------------

    const cargarSolicitudes = async () => {
        try {
            setLoadingVisitas(true);

            const data = await obtenerSolicitudesVisitaPorPractica(
                { solicitudVisitaRepository },
                practicaId
            );

            console.log("Solicitudes de visita:", data);

            setSolicitudesVisita(data || []);
        } catch (error) {
            console.error("Error cargando las solicitudes de visita:", error);
            toast.error("No se pudieron cargar las solicitudes");
            setSolicitudesVisita([]);
        } finally {
            setLoadingVisitas(false);
        }
    };

    const gestionarVisitas = () => {
        setMostrarModalVisitas(true);
        cargarSolicitudes();
    };


    // ---------------- Aceptar ----------------

    // SeleccionarFechaVisitaModal entrega:
    // { solicitudId, rangoId, fecha, hora }
    const onFechaElegida = (data) => {
        setVisitaPendiente(data);
        setSolicitudSeleccionFecha(null);
    };

    const confirmarAceptar = async () => {
        if (procesando || !visitaPendiente) return;

        try {
            setProcesando(true);

            await aceptarSolicitudVisita(
                { solicitudVisitaRepository },
                {
                    solicitud_visita_id: visitaPendiente.solicitudId,
                    solicitud_visita_fecha_id: visitaPendiente.rangoId,
                    fecha_visita: visitaPendiente.fecha,
                    hora_visita: visitaPendiente.hora
                }
            );

            toast.success("Visita aceptada correctamente");

            setVisitaPendiente(null);

            await cargarSolicitudes();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo aceptar la visita"
            );
        } finally {
            setProcesando(false);
        }
    };


    // ---------------- Rechazar ----------------

    const cerrarRechazo = () => {
        setSolicitudRechazar(null);
        setMotivoRechazo("");
    };

    const confirmarRechazar = async () => {
        if (procesando || !solicitudRechazar) return;

        const motivo = motivoRechazo.trim();

        if (motivo.length < 10) {
            toast.error("Escribe un motivo de al menos 10 caracteres");
            return;
        }

        try {
            setProcesando(true);

            await rechazarSolicitudVisita(
                { solicitudVisitaRepository },
                {
                    solicitud_visita_id: solicitudRechazar.id,
                    motivo
                }
            );

            toast.success("Solicitud rechazada");

            cerrarRechazo();

            await cargarSolicitudes();
        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo rechazar la solicitud"
            );
        } finally {
            setProcesando(false);
        }
    };


    // ---------------- Consultar visita por solicitud ----------------


    const handleVerVisita = async (solicitud) => {
        if (!solicitud?.id) {
            toast.error("No se encontró el ID de la solicitud de visita.");
            return;
        }

        try {
            setLoadingVisita(true);

            const resultado = await obtenerVisitaPorSolicitud(
                { visitaRepository },
                solicitud.id
            );

            console.log("Resultado de obtenerVisitaPorSolicitud:", resultado);

            // El caso de uso devuelve { data: visita }.
            const visita = resultado?.data ?? resultado;

            console.log("Visita obtenida:", visita);

            if (!visita?.id) {
                toast.error("No se encontró una visita para esta solicitud.");
                return;
            }

            // Navegar a la página de consulta de la visita.
            navigate(`/visita-empresarial/${solicitud.id}`, {
                state: {
                    solicitud,
                    visita
                }
            });

        } catch (error) {
            console.error("Error al consultar la visita:", error);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "No se pudo cargar la visita."
            );
        } finally {
            setLoadingVisita(false);
        }
    };



    // ---------------- Render ----------------

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-slate-400 text-sm">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-[#e8192c] rounded-full animate-spin" />
                <span>Cargando...</span>
            </div>
        );
    }

    const periodo = aperturas[0]?.periodo;

    const aperturasOrdenadas = [...aperturas].sort(
        (a, b) =>
            (b.practicantes?.length || 0) -
            (a.practicantes?.length || 0)
    );

    return (
        <div>
            <div className="p-6">

                {/* Encabezado */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Mis aperturas de vacante
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Practicantes de la práctica{" "}
                            <span className="font-medium text-gray-700">
                                {periodo || "Sin práctica asignada"}
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {aperturasOrdenadas.length > 0 && (
                            <button
                                onClick={gestionarVisitas}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                <MapPin size={18} />
                                Gestionar visitas
                            </button>
                        )}

                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Regresar
                        </button>
                    </div>
                </div>

                {/* Sin aperturas */}
                {aperturasOrdenadas.length === 0 && (
                    <div className="bg-white border rounded-xl p-8 text-center">
                        <Users size={45} className="mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">
                            No hay aperturas de vacante para esta práctica.
                        </p>
                    </div>
                )}

                {/* Aperturas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    {aperturasOrdenadas.map((apertura) => (
                        <AperturaCard
                            key={apertura.id}
                            apertura={apertura}
                            expandido={!!expandido[apertura.id]}
                            onToggle={() =>
                                setExpandido((prev) => ({
                                    ...prev,
                                    [apertura.id]: !prev[apertura.id]
                                }))
                            }
                            navigate={navigate}
                        />
                    ))}
                </div>
            </div>

            {/* ---------------- Modales ---------------- */}

            <SolicitudesVisitaModal2
                mostrar={mostrarModalVisitas}
                solicitudes={solicitudesVisita}
                loading={loadingVisitas}
                onCerrar={() => setMostrarModalVisitas(false)}
                onAceptar={setSolicitudSeleccionFecha}
                onRechazar={setSolicitudRechazar}
                onVerVisita={handleVerVisita}
            />

            {/* 1. Elegir fecha */}
            <SeleccionarFechaVisitaModal
                mostrar={!!solicitudSeleccionFecha}
                solicitud={solicitudSeleccionFecha}
                onCerrar={() => setSolicitudSeleccionFecha(null)}
                onConfirmar={onFechaElegida}
            />

            {/* 2. Confirmar aceptación */}
            <ConfirmModal
                isOpen={!!visitaPendiente}
                title="Aceptar visita"
                message="¿Confirmas la fecha y hora seleccionadas para la visita?"
                confirmLabel={procesando ? "Aceptando..." : "Aceptar visita"}
                confirmColor="bg-green-600 hover:bg-green-700"
                onConfirm={confirmarAceptar}
                onCancel={() => !procesando && setVisitaPendiente(null)}
            />

            {/* 3. Rechazar */}
            <ConfirmModal
                isOpen={!!solicitudRechazar}
                title="Rechazar solicitud"
                message="Indica el motivo para informar a los practicantes."
                confirmLabel={procesando ? "Rechazando..." : "Confirmar rechazo"}
                confirmColor="bg-red-600 hover:bg-red-700"
                showTextarea
                textareaValue={motivoRechazo}
                onTextareaChange={setMotivoRechazo}
                onConfirm={confirmarRechazar}
                onCancel={() => !procesando && cerrarRechazo()}
            />
        </div>
    );
};

export default MisAperturasTutorEmpresarial;
