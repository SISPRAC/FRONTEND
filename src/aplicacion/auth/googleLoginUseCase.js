import { passwordResetRepository } from "../../infraestructura/repository/PasswordresetRepository"; // ajusta nombre y ruta

export const googleLoginUseCase = async (idToken) => {
    return await passwordResetRepository.googleLogin(idToken);
};