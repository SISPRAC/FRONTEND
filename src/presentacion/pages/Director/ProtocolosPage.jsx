import React from "react";
import {
    GraduationCap,
    ClipboardList,
} from "lucide-react";

import PracticantesProtocolos from "./Documentos";

export default function ProtocolosPage() {
    return (
        <div className="p-6">
            {/* Encabezado */}
            <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <ClipboardList size={25} />
                </div>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        Gestión de protocolos
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Consulta y revisa los documentos de los practicantes.
                    </p>
                </div>
            </div>

            {/* Protocolos de practicantes */}
            <PracticantesProtocolos />
        </div>
    );
}