import Layout from "../../shared/Layouts/Layout";

import { ArrowLeft, Eye, CalendarDays } from "lucide-react";
import { getPracticantesGrupo } from "../../../aplicacion/tutorDocente/getPracticantesGrupo.js";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository.js";
import GenericTable from "../../components/Table/GenericTable";
import { useState, useEffect, useMemo } from "react";
import {
    useParams,
    useNavigate,
    useLocation
} from "react-router-dom";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import SolicitudVisitaModal from "../../components/modals/SolicitudVisitaModal.jsx";
import toast from "react-hot-toast";
import { crearSolicitudVisita } from "../../../aplicacion/solicitudVisita/crearSolicitudVisita.js";
import { obtenerSolicitudesVisitaTutorDocente } from "../../../aplicacion/solicitudVisita/obtenerSolicitudesVisitaTutorDocente.js";
import { solicitudVisitaRepository } from "../../../infraestructura/repository/solicitudVisitaRepository.js";

// Extrae, de la lista de solicitudes ya creadas, los ids de practicante
// que ya tienen una solicitud registrada (sin filtrar por estado).
// Si quieres permitir volver a solicitar cuando una solicitud fue
// rechazada/cancelada, filtra aquí por el campo de estado real de tu
// modelo SolicitudVisita antes de agregar el id al set.
const extraerIdsPracticantesConSolicitud = (solicitudes = []) => {

    const ids = new Set();

    solicitudes.forEach(solicitud => {

        (solicitud.practicantes || []).forEach(sv => {

            const idPracticante =
                sv?.practicaPracticante?.practicante?.id;

            if (idPracticante) {
                ids.add(idPracticante);
            }

        });

    });

    return ids;

};


const GrupoVistaTutorDocente = () => {

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [grupo, setGrupo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [mostrarModalSolicitud, setMostrarModalSolicitud] =
        useState(false);

    const [enviandoSolicitud, setEnviandoSolicitud] =
        useState(false);

    const [solicitudes, setSolicitudes] = useState([]);

    const navigate = useNavigate();

    const { id } = useParams();

    const location = useLocation();

    const practicaId = location.state?.practicaId;


    useEffect(() => {

        loadPracticantesGrupo();

        loadSolicitudes();

    }, []);


    const loadSolicitudes = async () => {

        try {

            const data = await obtenerSolicitudesVisitaTutorDocente(
                {
                    solicitudVisitaRepository
                }
            );

            setSolicitudes(data || []);

        } catch (error) {

            console.error(
                "Error al obtener las solicitudes de visita:",
                error
            );

        }

    };


    const idsConSolicitud = useMemo(
        () => extraerIdsPracticantesConSolicitud(solicitudes),
        [solicitudes]
    );


    const loadPracticantesGrupo = async () => {

        try {

            if (!practicaId) {

                toast.error(
                    "No se encontró la práctica asociada al grupo."
                );

                return;
            }

            setLoading(true);


            const data = await getPracticantesGrupo({

                tutorDocenteRepository,
                grupoId: id,
                practicaId

            });


            const formattedData =
                data.practicantes.map(practicante => ({

                    id: practicante.id_practicante,

                    codigo: practicante.codigo,

                    practicante: practicante.nombre,

                    empresa: practicante.empresa,

                    estado: practicante.estado

                }));


            setGrupo(data);

            setRows(formattedData);

            setCurrentPage(1);


        } catch (error) {

            console.error(
                "Error al obtener los practicantes del grupo:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Error al cargar los practicantes del grupo."
            );

            setRows([]);

        } finally {

            setLoading(false);

        }

    };


    const handleView = (id) => {

        const practicante =
            rows.find(p => p.id === id);


        if (!practicante) {

            toast.error(
                "No se encontró el practicante."
            );

            return;
        }


        if (!practicante.id) {

            toast.error(
                "Este candidato aún no está matriculado como practicante."
            );

            return;
        }


        navigate(
            `/informes/${practicante.id}`,
            {
                state: {
                    practicante: {
                        id: practicante.id,
                        nombre: practicante.practicante,
                        empresa: practicante.empresa
                    }
                }
            }
        );

    };


    const handleCrearSolicitud = async ({ practicantes, fechas }) => {

        setEnviandoSolicitud(true);

        try {

            await crearSolicitudVisita(
                {
                    solicitudVisitaRepository
                },
                {
                    practicantes,
                    fechas
                }
            );

            toast.success(
                "Solicitud de visita creada correctamente."
            );

            setMostrarModalSolicitud(false);

            loadSolicitudes();

        } catch (error) {

            console.error(
                "Error al crear solicitud:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Error al crear la solicitud de visita."
            );

        } finally {

            setEnviandoSolicitud(false);

        }
    };


    return (

        <Layout footerLabel="Tutor Docente">


            {/* ── Volver ── */}

            <div className="
                relative
                flex
                items-center
                justify-center
                mb-8
            ">

                <button

                    onClick={() => navigate(-1)}

                    className="
                        absolute
                        left-0
                        flex
                        items-center
                        gap-2
                        text-slate-600
                        hover:text-slate-900
                        font-medium
                        text-sm
                        px-3
                        py-2
                        rounded-md
                        hover:bg-slate-100
                        transition-colors
                    "
                >

                    <ArrowLeft size={20} />

                    Volver

                </button>

            </div>


            {/* ── Header ── */}

            <div className="
                flex
                justify-between
                items-start
                mb-6
                px-1
            ">


                {/* Periodo */}

                <div>

                    <p className="
                        text-xs
                        font-medium
                        text-slate-500
                        uppercase
                        tracking-widest
                        mb-0.5
                    ">
                        Periodo Lectivo
                    </p>


                    <p className="
                        text-2xl
                        font-extrabold
                        text-slate-800
                    ">

                        {grupo?.practica?.periodo?.nombre || "—"}

                    </p>

                </div>


                {/* Estado práctica */}

                <div className="text-right">

                    <p className="
                        text-xs
                        font-medium
                        text-slate-500
                        uppercase
                        tracking-widest
                        mb-0.5
                    ">
                        Estado de la Práctica
                    </p>


                    <p className="
                        text-2xl
                        font-extrabold
                        text-slate-800
                    ">

                        {grupo?.practica?.estado || "—"}

                    </p>

                </div>


            </div>


            {/* ── Fechas de la práctica ── */}

            <div className="
                flex
                justify-center
                gap-10
                mb-6
                px-1
            ">

                <div className="text-center">

                    <p className="
                        text-xs
                        font-medium
                        text-slate-500
                        uppercase
                        tracking-widest
                        mb-0.5
                    ">
                        Fecha de inicio
                    </p>

                    <p className="
                        text-lg
                        font-bold
                        text-slate-800
                    ">

                        {grupo?.practica?.fecha_inicio || "—"}

                    </p>

                </div>


                <div className="text-center">

                    <p className="
                        text-xs
                        font-medium
                        text-slate-500
                        uppercase
                        tracking-widest
                        mb-0.5
                    ">
                        Fecha de fin
                    </p>

                    <p className="
                        text-lg
                        font-bold
                        text-slate-800
                    ">

                        {grupo?.practica?.fecha_fin || "—"}

                    </p>

                </div>

            </div>


            {/* ── Título ── */}

            <h1 className="
                text-[30px]
                font-extrabold
                text-slate-800
                text-center
                mb-7
                tracking-tight
            ">

                {grupo?.nombre || "Grupo"}

            </h1>


            {/* ── Tabla ── */}

            <GenericTable

                rows={rows}

                loading={loading}

                currentPage={currentPage}

                onPageChange={setCurrentPage}


                columns={[

                    {
                        key: "codigo",
                        label: "Código",
                        primary: true
                    },

                    {
                        key: "practicante",
                        label: "Practicante"
                    },

                    {
                        key: "empresa",
                        label: "Empresa"
                    },

                    {
                        key: "estado",
                        label: "Estado",

                        render: (row) => (

                            <EstadoBadge
                                estado={row.estado}
                            />

                        )

                    }

                ]}


                actions={[

                    {
                        icon: <Eye size={18} />,

                        className:
                            "hover:bg-blue-100 text-blue-500",

                        onClick: handleView
                    }

                ]}


                emptyMessage="No hay Practicantes registrados."

                pageSize={7}

            />


            {/* ── Solicitar visita ── */}

            <div className="flex justify-end mt-4">

                <button

                    onClick={() => setMostrarModalSolicitud(true)}

                    disabled={rows.length === 0}

                    className="
                        flex
                        items-center
                        gap-2
                        px-4
                        py-2
                        rounded-lg
                        bg-[#e8192c]
                        text-white
                        font-semibold
                        text-sm
                        hover:opacity-90
                        disabled:opacity-40
                        disabled:cursor-not-allowed
                        transition
                    "
                >

                    <CalendarDays size={18} />

                    Solicitar visita

                </button>

            </div>


            <SolicitudVisitaModal

                open={mostrarModalSolicitud}
                onClose={() => setMostrarModalSolicitud(false)}
                practicantes={rows}
                onSubmit={handleCrearSolicitud}
                enviando={enviandoSolicitud}
                idsConSolicitud={idsConSolicitud}

            />


        </Layout>

    );

};


export default GrupoVistaTutorDocente;