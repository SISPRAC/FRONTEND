
export const registerEmpresa = async ( { EmpresaRepository },data) => {
  if (!data.get("correo")) {
    throw new Error("Correo requerido");
  }

  return await EmpresaRepository.register(data); // ✅ usa la capa infraestructura
};