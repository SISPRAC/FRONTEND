import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../shared/Layouts/Layout";

import { tutorEmpresarialRepository } from "../../../infraestructura/repository/tutorEmpresarialRepository.js";
import { getAperturasByPractica } from "../../../aplicacion/tutorEmpresarial/getAperturasByPractica.js";

import {
    Users,
    ClipboardCheck,
    MapPin,
    Briefcase,
    ArrowLeft,
    FileText,
    ChevronDown
} from "lucide-react";

// -----------------------------------------------------------------------
// Config de colores por estado. Se reutiliza tanto para el estado de la
// apertura/vacante como para el estado del practicante.
// -----------------------------------------------------------------------
export const ESTADOS_CONFIG = {
    Aceptado: {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500"
    },
    Activo: {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500"
    },
    Activa: {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500"
    },
    Aprobado: {
        bg: "bg-green-100",
        text: "text-green-700",
        dot: "bg-green-500"
    },
    "En curso": {
        bg: "bg-blue-100",
        text: "text-blue-700",
        dot: "bg-blue-500"
    },
    Retirado: {
        bg: "bg-red-100",
        text: "text-red-600",
        dot: "bg-red-500"
    },
    Rechazado: {
        bg: "bg-red-100",
        text: "text-red-600",
        dot: "bg-red-500"
    },
    Cancelado: {
        bg: "bg-red-100",
        text: "text-red-600",
        dot: "bg-red-500"
    },
    Cancelada: {
        bg: "bg-red-100",
        text: "text-red-600",
        dot: "bg-red-500"
    },
    Postulado: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        dot: "bg-yellow-500"
    },
    // Distinto de "En curso" para que no se confundan a simple vista
    Disponible: {
        bg: "bg-indigo-100",
        text: "text-indigo-700",
        dot: "bg-indigo-500"
    },
    Pendiente: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        dot: "bg-yellow-500"
    }
};

const ESTADO_DEFAULT = {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400"
};

// Mapa auxiliar en minúsculas, para que la búsqueda del color no dependa
// de mayúsculas/minúsculas ni de espacios extra que puedan venir del backend.
const ESTADOS_CONFIG_NORMALIZADO = Object.keys(ESTADOS_CONFIG).reduce(
    (acc, key) => {
        acc[key.trim().toLowerCase()] = ESTADOS_CONFIG[key];
        return acc;
    },
    {}
);

const obtenerConfigEstado = (estado) => {

    if (!estado) return ESTADO_DEFAULT;

    const clave = estado.trim().toLowerCase();

    return ESTADOS_CONFIG_NORMALIZADO[clave] || ESTADO_DEFAULT;

};

/**
 * Pequeño badge reutilizable para mostrar un estado con su color
 * correspondiente. Si el estado no está mapeado en ESTADOS_CONFIG,
 * cae en un estilo gris neutro por defecto.
 */
const EstadoBadge = ({ estado, className = "" }) => {

    if (!estado) return null;

    const config = obtenerConfigEstado(estado);

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.bg} ${config.text} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {estado}
        </span>
    );
};

const MisAperturasTutorEmpresarial = () => {

    const { practicaId } = useParams();
    const navigate = useNavigate();

    const [aperturas, setAperturas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Controla qué aperturas están desplegadas (acordeón). Se guarda por id.
    const [expandido, setExpandido] = useState({});

    useEffect(() => {

        const cargarAperturas = async () => {

            try {

                setLoading(true);

                const data = await getAperturasByPractica(
                    { tutorEmpresarialRepository },
                    practicaId
                );

                console.log(
                    "RESPUESTA DEL BACKEND:",
                    data
                );

                setAperturas(data || []);

                // Todas las aperturas inician cerradas; el usuario
                // decide cuáles abrir.

            } catch (error) {

                console.error(
                    "Error cargando las aperturas:",
                    error
                );

                setAperturas([]);

            } finally {

                setLoading(false);

            }
        };

        if (practicaId) {
            cargarAperturas();
        } else {
            setLoading(false);
        }

    }, [practicaId]);


    const toggleApertura = (id) => {

        setExpandido((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));

    };


    if (loading) {

        return (
            <Layout>

                <div className="flex justify-center items-center py-20">

                    <p className="text-gray-500">
                        Cargando información...
                    </p>

                </div>

            </Layout>
        );

    }


    /*
     * El período es el mismo para todas las aperturas
     * de la práctica, por lo que tomamos el primero.
     */
    const periodo = aperturas[0]?.periodo;

    /*
     * Ordenamos: las aperturas que sí tienen practicantes asociados
     * van primero; las que están vacías quedan al final.
     */
    const aperturasOrdenadas = [...aperturas].sort((a, b) => {
        const cantidadA = a.practicantes?.length || 0;
        const cantidadB = b.practicantes?.length || 0;
        return cantidadB - cantidadA;
    });


    return (
        <Layout>

            <div className="p-6">

                {/* ENCABEZADO */}
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Mis aperturas de vacante
                        </h1>

                        <p className="text-gray-500 mt-1">
                            Practicantes de la práctica {" "}
                            <span className="font-medium text-gray-700">
                                {periodo || "Sin práctica asignada"}
                            </span>
                        </p>

                    </div>


                    <div className="flex items-center gap-3">

                        {/* VISITAS: acción grupal, arriba para que sea visible de una vez */}
                        {aperturasOrdenadas.length > 0 && (

                            <button
                                onClick={() => {
                                    console.log(
                                        "Gestionar visitas de la práctica:",
                                        practicaId
                                    );
                                }}
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


                {/* SIN APERTURAS */}
                {aperturasOrdenadas.length === 0 && (

                    <div className="bg-white border rounded-xl p-8 text-center">

                        <Users
                            size={45}
                            className="mx-auto text-gray-400 mb-3"
                        />

                        <p className="text-gray-500">
                            No hay aperturas de vacante para esta práctica.
                        </p>

                    </div>

                )}


                {/* APERTURAS: grid de 2 columnas en pantallas grandes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                    {aperturasOrdenadas.map((apertura) => {

                        const cantidadPracticantes =
                            apertura.practicantes?.length || 0;

                        const tienePracticantes = cantidadPracticantes > 0;

                        const estaExpandido = !!expandido[apertura.id];

                        return (

                            <div
                                key={apertura.id}
                                className="bg-white border rounded-xl shadow-sm overflow-hidden"
                            >

                                {/* CABECERA: clickeable, funciona como select/acordeón */}
                                <button
                                    onClick={() => toggleApertura(apertura.id)}
                                    className="w-full flex items-start justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                >

                                    <div className="min-w-0">

                                        <h2 className="text-base font-semibold text-gray-800 truncate">

                                            {apertura.nombreVacante ||
                                                "Vacante"}

                                        </h2>


                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">

                                            <span className="flex items-center gap-1.5">

                                                <Briefcase size={15} />

                                                Cupos: {apertura.cupos}

                                            </span>


                                            <span className="flex items-center gap-1.5">

                                                <Users size={15} />

                                                {cantidadPracticantes}{" "}
                                                {cantidadPracticantes === 1
                                                    ? "practicante"
                                                    : "practicantes"}

                                            </span>


                                            <EstadoBadge estado={apertura.estado} />

                                        </div>

                                    </div>


                                    <ChevronDown
                                        size={20}
                                        className={`shrink-0 text-gray-500 mt-1 transition-transform ${estaExpandido ? "rotate-180" : ""
                                            }`}
                                    />

                                </button>


                                {/* PRACTICANTES: solo se muestran si la apertura está desplegada */}
                                {estaExpandido && (

                                    <div className="p-4 border-t">

                                        {/* SIN PRACTICANTES */}
                                        {!tienePracticantes && (

                                            <p className="text-sm text-gray-500">
                                                No hay practicantes asociados a esta apertura.
                                            </p>

                                        )}


                                        {/* LISTA DE PRACTICANTES: 1 solo ocupa todo el ancho, 2+ se acomodan en columnas */}
                                        <div
                                            className={`grid gap-3 ${cantidadPracticantes > 1
                                                    ? "grid-cols-1 sm:grid-cols-2"
                                                    : "grid-cols-1"
                                                }`}
                                        >

                                            {apertura.practicantes?.map(
                                                (practicante) => (

                                                    <div
                                                        key={practicante.id_practicante}
                                                        className="relative border rounded-lg p-3 pr-24 hover:border-gray-300 transition-colors"
                                                    >

                                                        {/* ESTADO: fijo en la esquina, no depende del largo del nombre */}
                                                        <EstadoBadge
                                                            estado={practicante.estado}
                                                            className="absolute top-3 right-3"
                                                        />

                                                        {/* NOMBRE */}
                                                        <h4 className="font-semibold text-gray-800 text-sm pr-2">

                                                            {practicante.nombre ||
                                                                "Practicante"}

                                                        </h4>


                                                        {/* CONTACTO */}
                                                        <p className="text-xs text-gray-500 mt-1.5">

                                                            {practicante.correo ||
                                                                "Correo no registrado"}
                                                            {" · "}
                                                            {practicante.telefono ||
                                                                "Teléfono no registrado"}

                                                        </p>


                                                        {/* ACCIONES INDIVIDUALES: pegadas justo debajo del practicante */}
                                                        <div className="flex flex-wrap gap-2 mt-3">

                                                            <button
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/informes/${practicante.id_practicante}`,
                                                                        {
                                                                            state: {
                                                                                practicante: {
                                                                                    id: practicante.id_practicante,
                                                                                    nombre: practicante.nombre,
                                                                                    correo: practicante.correo,
                                                                                    telefono: practicante.telefono,
                                                                                    estado: practicante.estado
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
                                                                onClick={() => {
                                                                    console.log(
                                                                        "Encuestas del practicante:",
                                                                        practicante.id_practicante
                                                                    );
                                                                }}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                                            >
                                                                <ClipboardCheck size={15} />
                                                                Encuestas
                                                            </button>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        );

                    })}

                </div>

            </div>

        </Layout>
    );
};

export default MisAperturasTutorEmpresarial;