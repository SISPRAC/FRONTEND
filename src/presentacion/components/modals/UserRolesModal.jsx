import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { getRoles } from "../../../aplicacion/rol/getRoles.js";
import { rolRepository } from "../../../infraestructura/repository/rolRepository.js";

export default function UserRolesModal({
    isOpen,
    onClose,
    onSubmit,
    user
}) {

    const [roles, setRoles] = useState([]);
    const [rolesSeleccionados, setRolesSeleccionados] = useState([]);
    const [loadingRoles, setLoadingRoles] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {

        if (!isOpen) return;

        loadRoles();

        if (user) {
            setRolesSeleccionados(
                user.Roles?.map(rol => rol.id) || []
            );
        }

    }, [isOpen, user]);

    const loadRoles = async () => {

        setLoadingRoles(true);

        try {

            const data = await getRoles(rolRepository);

            setRoles(data.roles);

        } catch (error) {

            toast.error("Error al cargar los roles");

        } finally {

            setLoadingRoles(false);

        }
    };

    const handleCheck = (id) => {

        setRolesSeleccionados((prev) =>
            prev.includes(id)
                ? prev.filter(roleId => roleId !== id)
                : [...prev, id]
        );

    };

    const handleClose = () => {

        if (saving) return;

        setRolesSeleccionados([]);

        onClose();

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (saving) return;

        if (rolesSeleccionados.length === 0) {
            toast.error("Seleccione al menos un rol");
            return;
        }

        setSaving(true);

        try {

            await onSubmit(rolesSeleccionados);

        } finally {

            setSaving(false);

        }

    };

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-xl relative">

                <button
                    onClick={handleClose}
                    disabled={saving}
                    className="
                        absolute top-4 right-4
                        text-slate-400 hover:text-red-500
                        disabled:opacity-50 disabled:cursor-not-allowed
                    "
                >
                    ✕
                </button>

                <h2 className="text-2xl font-extrabold text-slate-800 mb-2 text-center">
                    Administrar Roles
                </h2>

                <p className="text-center text-slate-500 mb-6">
                    {user?.nombres} {user?.apellidos}
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">

                    {loadingRoles ? (

                        // Skeleton
                        Array.from({ length: 4 }).map((_, i) => (

                            <div
                                key={i}
                                className="
                                    flex items-center gap-3
                                    border rounded-lg p-3
                                    animate-pulse
                                "
                            >
                                <div className="w-4 h-4 rounded bg-slate-200" />
                                <div className="h-4 w-1/2 rounded bg-slate-200" />
                            </div>

                        ))

                    ) : (

                        roles.map((rol) => (

                            <label
                                key={rol.id}
                                className="
                                    flex items-center gap-3
                                    border rounded-lg p-3
                                    cursor-pointer hover:bg-slate-50
                                "
                            >

                                <input
                                    type="checkbox"
                                    checked={rolesSeleccionados.includes(rol.id)}
                                    onChange={() => handleCheck(rol.id)}
                                    disabled={saving}
                                />

                                <span className="font-medium">
                                    {rol.nombre}
                                </span>

                            </label>

                        ))

                    )}

                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={saving}
                            className="
                                px-5 py-2 rounded-xl
                                bg-slate-200 hover:bg-slate-300
                                disabled:opacity-50 disabled:cursor-not-allowed
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            disabled={saving || loadingRoles}
                            className="
                                px-5 py-2 rounded-xl
                                bg-[#e8192c] text-white
                                hover:bg-[#c8111f]
                                disabled:opacity-60 disabled:cursor-not-allowed
                                flex items-center gap-2
                            "
                        >
                            {saving && (
                                <span
                                    className="
                                        w-4 h-4 rounded-full
                                        border-2 border-white/40 border-t-white
                                        animate-spin
                                    "
                                />
                            )}
                            {saving ? "Guardando..." : "Guardar"}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}