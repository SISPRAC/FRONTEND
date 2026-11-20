export const resetPassword = async (
  { passwordResetRepository },
  { token, nuevaPassword, confirmarPassword }
) => {

  if (!token) {
    throw new Error("El enlace es inválido o ha expirado");
  }

  if (!nuevaPassword || !confirmarPassword) {
    throw new Error("Completa ambos campos");
  }

  if (nuevaPassword.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres");
  }

  if (!/[A-Za-z]/.test(nuevaPassword) || !/\d/.test(nuevaPassword)) {
    throw new Error("La contraseña debe incluir letras y números");
  }

  if (nuevaPassword !== confirmarPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  // confirmarPassword es solo validación de la UI: no se envía al backend
  return await passwordResetRepository.resetPassword({ token, nuevaPassword });
};