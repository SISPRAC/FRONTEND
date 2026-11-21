import {
    Search,
    X,
    UserPlus,
    FileSpreadsheet
} from "lucide-react";

import GenericTable from "../../components/Table/GenericTable";
import InvitarCandidatosModal from "../../components/modals/Invitarcandidatosmodal.jsx";
import InvitarCandidatoIndividualModal from "../../components/modals/InvitarCandidatoIndividualModal.jsx";

import { useEffect, useMemo, useState } from "react";

import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository.js";
import { getCandidatos } from "../../../aplicacion/candidato/getCandidatos.js";

const CandidatosPracticas = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    // opciones | individual | plantilla
    const [modalInvitacion, setModalInvitacion] = useState(null);

    const cargarCandidatos = async () => {
        try {
            setLoading(true);
            const candidatos = await getCandidatos({ candidatoRepository });
            console.log("Candidatos cargados:", candidatos);
            setRows(candidatos);
        } catch (error) {
            console.error("Error al cargar los candidatos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarCandidatos();
    }, []);

    const candidatosFiltrados = useMemo(() => {
        const texto = busqueda.toLowerCase().trim();

        if (!texto) return rows;

        return rows.filter(
            (c) =>
                c.codigo?.toString().toLowerCase().includes(texto) ||
                c.nombre?.toLowerCase().includes(texto) ||
                c.correo?.toLowerCase().includes(texto) ||
                c.telefono?.toString().includes(texto)
        );
    }, [rows, busqueda]);

    return (
        <div>
            <h1 className="text-[26px] font-extrabold text-slate-800 text-center mb-7 tracking-tight">
                Candidatos
            </h1>

            {/* BARRA SUPERIOR: botón invitar + buscador */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                <button
                    type="button"
                    onClick={() => setModalInvitacion("opciones")}
                    className="flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#e8192c] text-white hover:bg-[#c8111f] text-sm font-semibold shadow-sm"
                >
                    <UserPlus size={18} />
                    Invitar
                </button>

                <div className="relative w-full md:w-72">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Buscar candidato..."
                        className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition hover:border-slate-300 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    />

                    {busqueda && (
                        <button
                            type="button"
                            onClick={() => {
                                setBusqueda("");
                                setCurrentPage(1);
                            }}
                            aria-label="Limpiar búsqueda"
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* SKELETON / TABLA */}
            {loading ? (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                    <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-3 w-20 rounded bg-slate-200 animate-pulse"
                            />
                        ))}
                    </div>

                    {[1, 2, 3].map((fila) => (
                        <div
                            key={fila}
                            className="grid grid-cols-5 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
                        >
                            {[1, 2, 3, 4].map((c) => (
                                <div
                                    key={c}
                                    className="h-3 w-2/3 rounded bg-slate-200 animate-pulse"
                                />
                            ))}

                            <div className="flex justify-center">
                                <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <GenericTable
                    rows={candidatosFiltrados}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    columns={[
                        { key: "codigo", label: "Código", primary: true },
                        { key: "nombre", label: "Nombre" },
                        { key: "correo", label: "Correo" },
                        { key: "telefono", label: "Teléfono" },
                    ]}
                    emptyMessage="No hay candidatos registrado"
                    pageSize={6}
                />
            )}

            {/* MODAL DE OPCIONES */}
            {modalInvitacion === "opciones" && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl p-7 shadow-xl relative">

                        <button
                            type="button"
                            onClick={() => setModalInvitacion(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-red-500"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-xl font-extrabold text-slate-800 text-center mb-2">
                            Invitar candidatos
                        </h2>

                        <p className="text-sm text-slate-500 text-center mb-7">
                            Selecciona cómo deseas realizar las invitaciones.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* INVITACIÓN INDIVIDUAL */}
                            <button
                                type="button"
                                onClick={() => setModalInvitacion("individual")}
                                className="flex flex-col items-center text-center gap-3 p-6 border border-slate-200 rounded-xl hover:border-[#e8192c] hover:bg-red-50/40 transition"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-100 text-[#e8192c] flex items-center justify-center">
                                    <UserPlus size={25} />
                                </div>

                                <span className="font-bold text-slate-800">
                                    Individual
                                </span>

                                <span className="text-xs text-slate-500">
                                    Registrar los datos de un candidato y enviar su invitación.
                                </span>
                            </button>

                            {/* INVITACIÓN POR PLANTILLA */}
                            <button
                                type="button"
                                onClick={() => setModalInvitacion("plantilla")}
                                className="flex flex-col items-center text-center gap-3 p-6 border border-slate-200 rounded-xl hover:border-[#e8192c] hover:bg-red-50/40 transition"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-100 text-[#e8192c] flex items-center justify-center">
                                    <FileSpreadsheet size={25} />
                                </div>

                                <span className="font-bold text-slate-800">
                                    Por plantilla
                                </span>

                                <span className="text-xs text-slate-500">
                                    Cargar un listado de candidatos mediante PDF o Excel.
                                </span>
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL INDIVIDUAL */}
            {modalInvitacion === "individual" && (
                <InvitarCandidatoIndividualModal
                    isOpen={true}
                    onClose={() => setModalInvitacion(null)}
                    onInvitados={cargarCandidatos}
                />
            )}

            {/* MODAL POR PLANTILLA: CONSERVA LOS ESTADOS Y LA VISTA PREVIA */}
            {modalInvitacion === "plantilla" && (
                <InvitarCandidatosModal
                    isOpen={true}
                    onClose={() => setModalInvitacion(null)}
                    candidatosRegistrados={rows}
                    onInvitados={cargarCandidatos}
                />
            )}

        </div>
    );
};

export default CandidatosPracticas;
