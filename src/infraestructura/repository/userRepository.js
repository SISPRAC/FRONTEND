import {
    getUsersRequest,
    getUserRequest,
    updateUserRolesRequest,
    deleteUserRequest
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
    }

};