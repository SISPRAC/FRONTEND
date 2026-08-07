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
        try {

            const data = await getRoles(rolRepository);

            setRoles(data.roles);

        } catch (error) {

            toast.error("Error al cargar los roles");

        }
    };

    const handleCheck = (id) => {

        if (rolesSeleccionados.includes(id)) {

            setRolesSeleccionados(
                rolesSeleccionados.filter(roleId => roleId !== id)
            );

        } else {

            setRolesSeleccionados([
                ...rolesSeleccionados,
                id
            ]);

        }

    };

    const handleClose = () => {

        setRolesSeleccionados([]);

        onClose();

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (rolesSeleccionados.length === 0) {

            toast.error("Seleccione al menos un rol");

            return;

        }

        await onSubmit(rolesSeleccionados);

    };

    if (!isOpen) return null;

    return (

        <div
            className="
                fixed inset-0
                bg-black/40
                flex items-center justify-center
                z-50
            "
        >

            <div
                className="
                    bg-white
                    w-full
                    max-w-lg
                    rounded-2xl
                    p-8
                    shadow-xl
                    relative
                "
            >

                <button
                    onClick={handleClose}
                    className="
                        absolute
                        top-4
                        right-4
                        text-slate-400
                        hover:text-red-500
                    "
                >
                    ✕
                </button>

                <h2
                    className="
                        text-2xl
                        font-extrabold
                        text-slate-800
                        mb-2
                        text-center
                    "
                >
                    Administrar Roles
                </h2>

                <p className="text-center text-slate-500 mb-6">

                    {user?.nombres} {user?.apellidos}

                </p>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-3"
                >

                    {
                        roles.map((rol) => (

                            <label
                                key={rol.id}
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    border
                                    rounded-lg
                                    p-3
                                    cursor-pointer
                                    hover:bg-slate-50
                                "
                            >

                                <input
                                    type="checkbox"
                                    checked={rolesSeleccionados.includes(rol.id)}
                                    onChange={() => handleCheck(rol.id)}
                                />

                                <span className="font-medium">

                                    {rol.nombre}

                                </span>

                            </label>

                        ))
                    }

                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={handleClose}
                            className="
                                px-5
                                py-2
                                rounded-xl
                                bg-slate-200
                                hover:bg-slate-300
                            "
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="
                                px-5
                                py-2
                                rounded-xl
                                bg-[#e8192c]
                                text-white
                                hover:bg-[#c8111f]
                            "
                        >
                            Guardar
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}