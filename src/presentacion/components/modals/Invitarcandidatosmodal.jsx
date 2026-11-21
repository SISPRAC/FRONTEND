
import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository.js";
import { invitarCandidato } from "../../../aplicacion/candidato/invitarCandidato.js";

export default function InvitarCandidatoIndividualModal({
    isOpen,
    onClose,
    onInvitados
}) {
    const [formulario, setFormulario] = useState({
        nombre: "",
        correo: "",
        codigo: ""
    });

    const [enviando, setEnviando] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormulario((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const cerrar = () => {
        if (enviando) return;

        setFormulario({
            nombre: "",
            correo: "",
            codigo: ""
        });

        onClose();
    };

    const confirmar = async (e) => {
        e.preventDefault();

        const nombre = formulario.nombre.trim();
        const correo = formulario.correo.trim().toLowerCase();
        const codigo = formulario.codigo.trim();

        if (!nombre || !correo || !codigo) {
            toast.error("Completa todos los campos.");
            return;
        }

        setEnviando(true);

        try {
            await invitarCandidato(candidatoRepository, {
                nombre,
                correo,
                codigo
            });

            toast.success("Invitación enviada correctamente.");

            onInvitados?.();

            setFormulario({
                nombre: "",
                correo: "",
                codigo: ""
            });

            onClose();

        } catch (error) {
            console.error("Error al invitar candidato:", error);

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "No fue posible enviar la invitación."
            );
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-xl relative">

                <button
                    type="button"
                    onClick={cerrar}
                    disabled={enviando}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 disabled:opacity-50"
                >
                    <X size={23} />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-100 text-[#e8192c] flex items-center justify-center mb-3">
                        <UserPlus size={25} />
                    </div>

                    <h2 className="text-xl font-extrabold text-slate-800">
                        Invitación individual
                    </h2>

                    <p className="text-sm text-slate-500 text-center mt-1">
                        Ingresa los datos del candidato que deseas invitar.
                    </p>
                </div>

                <form onSubmit={confirmar} className="space-y-4">

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Nombre completo
                        </label>

                        <input
                            type="text"
                            name="nombre"
                            value={formulario.nombre}
                            onChange={handleChange}
                            placeholder="Nombre del candidato"
                            maxLength={150}
                            disabled={enviando}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            name="correo"
                            value={formulario.correo}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            maxLength={150}
                            disabled={enviando}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Código estudiantil
                        </label>

                        <input
                            type="text"
                            name="codigo"
                            value={formulario.codigo}
                            onChange={handleChange}
                            placeholder="Código del estudiante"
                            maxLength={30}
                            disabled={enviando}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
                        />
                    </div>

                    <div className="flex justify-center gap-3 pt-4">
                        <button
                            type="button"
                            onClick={cerrar}
                            disabled={enviando}
                            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm font-semibold disabled:opacity-50"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={enviando}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e8192c] text-white hover:bg-[#c8111f] text-sm font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            <UserPlus size={17} />
                            {enviando ? "Enviando..." : "Enviar invitación"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
