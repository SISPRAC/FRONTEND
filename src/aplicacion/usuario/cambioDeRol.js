export const updateUserRoles = async ({ userRepository },id, roles) => {
    return await userRepository.updateRoles(id, roles);
};