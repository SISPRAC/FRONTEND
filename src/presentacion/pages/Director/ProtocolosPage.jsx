import React, { useState } from "react";
import {
    GraduationCap,
    Building2,
    ClipboardList,
} from "lucide-react";

import PracticantesProtocolos from "./Documentos";
import EmpresasProtocolos from "./EmpresasProtocolos";

export default function ProtocolosPage() {
    const [vistaActiva, setVistaActiva] = useState("practicantes");

    const opciones = [
        { id: "practicantes", label: "Practicantes", icon: GraduationCap },
        { id: "empresas", label: "Empresas", icon: Building2 },
    ];

    return (
        <div className="p-6">
            {/* Encabezado + selector */}
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <ClipboardList size={25} />
                    </div>

                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            Gestión de protocolos
                        </h1>

                        <p className="mt-1 text-sm text-gray-500">
                            Consulta y revisa los documentos de practicantes y empresas.
                        </p>
                    </div>
                </div>

                {/* Selector de vista */}
                <div className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm sm:self-auto">
                    {opciones.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setVistaActiva(id)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${vistaActiva === id
                                    ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                                }`}
                        >
                            <Icon size={17} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vistas independientes */}
            {vistaActiva === "practicantes" ? (
                <PracticantesProtocolos />
            ) : (
                <EmpresasProtocolos />
            )}
        </div>
    );
}