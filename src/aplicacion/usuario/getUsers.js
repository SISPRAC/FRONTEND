export const getUsers = async ({ userRepository }) => {
    return await userRepository.getAll();
};