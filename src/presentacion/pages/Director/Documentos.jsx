import React, { useMemo, useState } from "react";
import {
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    FileText,
} from "lucide-react";

import Layout from "../../shared/Layouts/Layout";
import GenericTable from "../../components/Table/GenericTable";

// -----------------------------------------------------------------------
// DATOS DE PRUEBA
// -----------------------------------------------------------------------

const gruposDemo = [
    {
        id: 1,
        nombre: "Grupo 01 - ADSO",
    },
    {
        id: 2,
        nombre: "Grupo 02 - ADSO",
    },
    {
        id: 3,
        nombre: "Grupo 03 - Programación",
    },
];

const practicantesDemo = [
    {
        id: 1,
        codigo: "11254",
        nombre: "Carlos Alfredo Linero Sepúlveda",
        empresa: "Tech Solutions S.A.S.",
        grupo: 1,
        documentos: [
            {
                id: 1,
                nombre: "Hoja de vida",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 2,
                nombre: "Cédula de ciudadanía",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 3,
                nombre: "Carta de aceptación",
                estado: "Subido",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 4,
                nombre: "Contrato de aprendizaje",
                estado: "Pendiente",
                fileUrl: null,
            },
            {
                id: 5,
                nombre: "Afiliación a la ARL",
                estado: "Rechazado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
        ],
    },

    {
        id: 2,
        codigo: "11255",
        nombre: "María Fernanda Gómez",
        empresa: "Innovate Colombia S.A.S.",
        grupo: 1,
        documentos: [
            {
                id: 6,
                nombre: "Hoja de vida",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 7,
                nombre: "Cédula de ciudadanía",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 8,
                nombre: "Carta de aceptación",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 9,
                nombre: "Contrato de aprendizaje",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 10,
                nombre: "Afiliación a la ARL",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
        ],
    },

    {
        id: 3,
        codigo: "11256",
        nombre: "Juan Sebastián Rodríguez",
        empresa: "Desarrollo Digital S.A.S.",
        grupo: 2,
        documentos: [
            {
                id: 11,
                nombre: "Hoja de vida",
                estado: "Aceptado",
                fileUrl:
                    "https://www.sefh.es/bibliotecavirtual/fhtomo2/CAP24.pdf",
            },
            {
                id: 12,
                nombre: "Cédula de ciudadanía",
                estado: "Pendiente",
                fileUrl: null,
            },
            {
                id: 13,
                nombre: "Carta de aceptación",
                estado: "Pendiente",
                fileUrl: null,
            },
            {
                id: 14,
                nombre: "Contrato de aprendizaje",
                estado: "Rechazado",
                fileUrl:
                    "https://www.cicy.mx/Documentos/CICY/sitios/CircuitoEtnobiologico/Repositorio/Documentos/2021_07%20Manual%20de%20propagaci%C3%B3n%20Plantas%20Vivero.PDF",
            },
            {
                id: 15,
                nombre: "Afiliación a la ARL",
                estado: "Pendiente",
                fileUrl: null,
            },
        ],
    },

    {
        id: 4,
        codigo: "11257",
        nombre: "Laura Valentina Pérez",
        empresa: "Software & Apps Colombia",
        grupo: 2,
        documentos: [
            {
                id: 16,
                nombre: "Hoja de vida",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 17,
                nombre: "Cédula de ciudadanía",
                estado: "Aceptado",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 18,
                nombre: "Carta de aceptación",
                estado: "Subido",
                fileUrl:
                    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            {
                id: 19,
                nombre: "Contrato de aprendizaje",
                estado: "Pendiente",
                fileUrl: null,
            },
            {
                id: 20,
                nombre: "Afiliación a la ARL",
                estado: "Pendiente",
                fileUrl: null,
            },
        ],
    },
];

// -----------------------------------------------------------------------
// Badge de estado
// -----------------------------------------------------------------------

function DocEstadoBadge({ estado }) {
    const styles = {
        Aceptado: "bg-green-100 text-green-700",
        Subido: "bg-green-100 text-green-700",
        Pendiente: "bg-gray-200 text-gray-600",
        Rechazado: "bg-red-100 text-red-600",
    };

    return (
        <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[estado] || styles.Pendiente
                }`}
        >
            {estado}
        </span>
    );
}

// -----------------------------------------------------------------------
// Modal de documentos
// -----------------------------------------------------------------------

function ProtocoloCarouselModal({
    open,
    onClose,
    candidato,
    documentos = [],
}) {
    const [index, setIndex] = useState(0);

    if (!open) return null;

    const doc = documentos[index];
    const total = documentos.length;

    const goPrev = () => {
        setIndex((i) => (i - 1 + total) % total);
    };

    const goNext = () => {
        setIndex((i) => (i + 1) % total);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-900">
                        Protocolos
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Información del practicante */}
                <div className="space-y-1 px-6 pb-4 pt-4 text-sm text-gray-800">
                    <p>
                        <span className="font-bold">Código:</span>{" "}
                        {candidato?.codigo}
                    </p>

                    <p>
                        <span className="font-bold">Nombre:</span>{" "}
                        {candidato?.nombre}
                    </p>

                    <p>
                        <span className="font-bold">Empresa:</span>{" "}
                        {candidato?.empresa}
                    </p>
                </div>

                {total === 0 ? (
                    <p className="px-6 pb-8 text-sm text-gray-400">
                        Este practicante no tiene documentos requeridos.
                    </p>
                ) : (
                    <>
                        {/* Nombre y estado del documento */}
                        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
                            <p className="truncate pr-3 text-sm font-semibold text-gray-800">
                                {doc.nombre}
                            </p>

                            <DocEstadoBadge estado={doc.estado} />
                        </div>

                        {/* Vista previa */}
                        <div className="relative mx-6 flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                            {total > 1 && (
                                <button
                                    onClick={goPrev}
                                    className="absolute left-2 z-10 rounded-full bg-white p-2 text-gray-500 shadow hover:text-red-500"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                            )}

                            <div className="flex h-[400px] w-full items-center justify-center">
                                {doc.fileUrl ? (
                                    <iframe
                                        title={doc.nombre}
                                        src={doc.fileUrl}
                                        className="h-full w-full"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <FileText size={48} />

                                        <p className="text-sm">
                                            Sin archivo cargado
                                        </p>
                                    </div>
                                )}
                            </div>

                            {total > 1 && (
                                <button
                                    onClick={goNext}
                                    className="absolute right-2 z-10 rounded-full bg-white p-2 text-gray-500 shadow hover:text-red-500"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            )}
                        </div>

                        {/* Contador */}
                        <p className="mt-3 text-center text-xs font-medium text-gray-400">
                            Documento {index + 1} de {total}
                        </p>
                    </>
                )}

                {/* Footer */}
                <div className="flex justify-center px-6 pb-6 pt-4">
                    <button
                        onClick={onClose}
                        className="rounded-full bg-red-500 px-10 py-2.5 text-sm font-bold text-white hover:bg-red-600"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Página principal
// -----------------------------------------------------------------------

export default function ProtocolosPage({
    grupos = gruposDemo,
    practicantes = practicantesDemo,
    periodoLabel = "2026 - I",
}) {
    const [grupoId, setGrupoId] = useState("todos");
    const [currentPage, setCurrentPage] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [candidatoActivo, setCandidatoActivo] = useState(null);

    const rows = useMemo(() => {
        const filtradas =
            grupoId === "todos"
                ? practicantes
                : practicantes.filter(
                    (p) => String(p.grupo) === String(grupoId)
                );

        return filtradas.map((p) => {
            const subidos = (p.documentos || []).filter(
                (d) =>
                    d.estado === "Aceptado" ||
                    d.estado === "Subido"
            ).length;

            const total = (p.documentos || []).length;

            return {
                ...p,
                documentosResumen: `${subidos}/${total}`,
                documentosCompleto:
                    subidos === total && total > 0,
            };
        });
    }, [grupoId, practicantes]);

    const verProtocolos = (row) => {
        setCandidatoActivo(row);
        setModalOpen(true);
    };

    return (
        <Layout footerLabel="Director">
            <div className="p-6">
                {/* Encabezado */}
                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500">
                        Periodo Lectivo
                    </p>

                    <p className="text-lg font-bold text-gray-900">
                        {periodoLabel}
                    </p>

                    <h1 className="mt-5 text-2xl font-bold text-gray-900">
                        Practicantes - Protocolos
                    </h1>
                </div>

                {/* Filtro */}
                <div className="mb-4 flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">
                        Grupo
                    </span>

                    <select
                        value={grupoId}
                        onChange={(e) => {
                            setGrupoId(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 outline-none focus:border-red-400"
                    >
                        <option value="todos">
                            Todos los grupos
                        </option>

                        {grupos.map((g) => (
                            <option key={g.id} value={g.id}>
                                {g.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabla */}
                <GenericTable
                    rows={rows}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    columns={[
                        {
                            key: "codigo",
                            label: "Código",
                            primary: true,
                        },
                        {
                            key: "nombre",
                            label: "Nombre",
                        },
                        {
                            key: "empresa",
                            label: "Empresa",
                        },
                        {
                            key: "documentosResumen",
                            label: "# Documentos",
                            render: (row) => (
                                <span
                                    className={`font-semibold ${row.documentosCompleto
                                            ? "text-green-600"
                                            : "text-red-500"
                                        }`}
                                >
                                    {row.documentosResumen}
                                </span>
                            ),
                        },
                    ]}
                    actions={[
                        {
                            icon: <Eye size={18} />,
                            className: "hover:bg-red-100 text-red-500",
                            onClick: (id) => {
                                const row = rows.find((p) => p.id === id);

                                if (!row) {
                                    console.log(
                                        "No se encontró el practicante con ID:",
                                        id
                                    );
                                    return;
                                }

                                console.log("Practicante seleccionado:", row);

                                setCandidatoActivo(row);
                                setModalOpen(true);
                            },
                        },
                    ]}
                    emptyMessage="No hay practicantes registrados en este grupo."
                    pageSize={7}
                />
            </div>

            {/* Modal */}
            <ProtocoloCarouselModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setCandidatoActivo(null);
                }}
                candidato={candidatoActivo}
                documentos={
                    candidatoActivo?.documentos || []
                }
            />
        </Layout >
    );
}