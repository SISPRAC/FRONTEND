import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";

import GenericTable from "../../components/Table/GenericTable";
import UserRolesModal from "../../components/modals/UserRolesModal";

import { SquarePen } from "lucide-react";
import toast from "react-hot-toast";

import { userRepository } from "../../../infraestructura/repository/userRepository.js";
import { getUsers } from "../../../aplicacion/usuario/getUsers";
import { updateUserRoles } from "../../../aplicacion/usuario/cambioDeRol";

export default function UsersPage() {

    const [rows, setRows] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {

        try {

            const data = await getUsers({
                userRepository
            });

            setRows(data);
            setCurrentPage(1);

        } catch (error) {

            console.log(error);

        }

    };

    const handleEdit = (id) => {

        const usuario = rows.find(row => row.id === id);

        setSelectedUser(usuario);

        setIsOpen(true);

    };

    const handleUpdate = async (roles) => {

        try {

            await updateUserRoles(
                { userRepository },
                selectedUser.id,
                roles
            );

            await loadUsers();

            toast.success("Roles actualizados");

            setIsOpen(false);
            setSelectedUser(null);

        } catch (error) {

            console.log("Error", error);

            toast.error(
                error.response?.data?.message ||
                "Error al actualizar roles"
            );

        }

    };

    return (

        <Layout
           
            footerLabel="Administrador"
        >

            <h1
                className="
                    text-[26px]
                    font-extrabold
                    text-slate-800
                    text-center
                    mb-7
                    tracking-tight
                "
            >
                Usuarios
            </h1>

            <GenericTable
                rows={rows}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                columns={[
                    {
                        key: "nombres",
                        label: "Nombre",
                        primary: true,
                        render: row => `${row.nombres} ${row.apellidos}`
                    },
                    {
                        key: "correo",
                        label: "Correo"
                    },
                    {
                        key: "roles",
                        label: "Roles",
                        render: row =>
                            row.Roles?.map(rol => rol.nombre).join(", ")
                    }
                ]}
                actions={[
                    {
                        icon: <SquarePen size={24} />,
                        className: "hover:bg-blue-100",
                        onClick: handleEdit
                    }
                ]}
                emptyMessage="No hay usuarios registrados."
                pageSize={6}
            />

            <UserRolesModal
                isOpen={isOpen}
                onClose={() => {
                    setIsOpen(false);
                    setSelectedUser(null);
                }}
                onSubmit={handleUpdate}
                user={selectedUser}
            />

        </Layout>

    );

}