import { MapPin, X } from "lucide-react";
import SolicitudVisitaCard from "../cards/SolicitudVisitaCard"

const SolicitudesVisitaModal2 = ({
    mostrar,
    solicitudes,
    loading,
    onCerrar,
    onAceptar,
    onRechazar
}) => {
    if (!mostrar) return null;

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
                        onClick={onCerrar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Contenido */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">

                    {loading && (
                        <p className="text-center text-gray-500 py-12">
                            Cargando solicitudes...
                        </p>
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
                        <div className="space-y-3">
                            {solicitudes.map((solicitud) => (
                                <SolicitudVisitaCard
                                    key={solicitud.id}
                                    solicitud={solicitud}
                                    onAceptar={onAceptar}
                                    onRechazar={onRechazar}
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