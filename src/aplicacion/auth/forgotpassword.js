export const forgotPassword = async ({ passwordResetRepository }, { correo }) => {

  if (!correo || !correo.trim()) {
    throw new Error("Ingresa tu correo electrónico");
  }

  return await passwordResetRepository.forgotPassword({
    correo: correo.trim().toLowerCase()
  });
};