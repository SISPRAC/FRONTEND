
import { useState } from "react";
import { MapPin, X, LoaderCircle } from "lucide-react";
import SolicitudVisitaCard from "../cards/SolicitudVisitaCard";

const SolicitudesVisitaModal2 = ({
    mostrar,
    solicitudes,
    loading,
    onCerrar,
    onAceptar,
    onRechazar,
    onVerVisita,
    estadosPracticantes
}) => {
    const [visitaCargandoId, setVisitaCargandoId] = useState(null);

    if (!mostrar) return null;

    const handleVerVisita = async (solicitud) => {
        if (visitaCargandoId !== null) return;

        setVisitaCargandoId(solicitud.id);

        try {
            await onVerVisita(solicitud);
        } catch (error) {
            console.error("Error al abrir la visita:", error);
        } finally {
            setVisitaCargandoId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Solicitudes de visita
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            Solicitudes de los practicantes de esta práctica
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCerrar}
                        disabled={visitaCargandoId !== null}
                        aria-label="Cerrar solicitudes"
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">

                    {loading && (
                        <div className="flex flex-col items-center justify-center gap-3 py-8 text-gray-500">
                            <LoaderCircle
                                size={28}
                                className="animate-spin text-[#e8192c]"
                            />

                            <span className="text-sm">
                                Cargando solicitudes...
                            </span>
                        </div>
                    )}

                    {!loading && solicitudes.length === 0 && (
                        <div className="text-center py-12">
                            <MapPin
                                size={42}
                                className="mx-auto text-gray-400 mb-3"
                            />

                            <p className="text-gray-500">
                                No hay solicitudes de visita para esta práctica.
                            </p>
                        </div>
                    )}

                    {!loading && solicitudes.length > 0 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                            {solicitudes.map((solicitud) => (
                                <SolicitudVisitaCard
                                    key={solicitud.id}
                                    solicitud={solicitud}
                                    onAceptar={onAceptar}
                                    onRechazar={onRechazar}
                                    onVerVisita={() => handleVerVisita(solicitud)}
                                    visitaCargando={visitaCargandoId === solicitud.id}
                                    bloquearAcciones={visitaCargandoId !== null}
                                    estadosPracticantes={estadosPracticantes}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SolicitudesVisitaModal2;
