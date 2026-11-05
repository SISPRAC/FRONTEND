import {
    getUsersRequest,
    getUserRequest,
    updateUserRolesRequest,
    deleteUserRequest,
    cambiarEstadoUsuarioRequest,
    actualizarPerfilRequest
} from "../api/usuario.api";


export const userRepository = {

    async getAll() {
        const { data } = await getUsersRequest();
        return data;
    },

    async getMe() {
        const { data } = await getUserRequest();
        return data;
    },

    async updateRoles(id, roles) {
        const { data } = await updateUserRolesRequest(id, roles);
        return data;
    },

    async delete(id) {
        const { data } = await deleteUserRequest(id);
        return data;
    },

    async cambiarEstado(id, estado) {
        const { data } = await cambiarEstadoUsuarioRequest(id, estado);
        return data;
    },

    async actualizarPerfil(datos) {
        const { data } = await actualizarPerfilRequest(datos);
        return data;
    }

};