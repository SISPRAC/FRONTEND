
import { useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import { userRepository } from "../../infraestructura/repository/userRepository";

export default function ProtectedRoute({ roles }) {

  const token = localStorage.getItem("token");
  const location = useLocation();

  const esProteccionPrincipal = roles === undefined;

  const [perfilCompletado, setPerfilCompletado] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  let usuario = null;

  try {

    if (token) {
      usuario = jwtDecode(token);
    }

  } catch (error) {

    localStorage.removeItem("token");
    localStorage.removeItem("rolActivo");

  }

  const rolActivo = usuario
    ? localStorage.getItem("rolActivo") ?? usuario.roles?.[0]
    : null;


  // =====================================================
  // VALIDAR PERFIL EN LA RUTA PRINCIPAL
  // =====================================================

  useEffect(() => {

    if (!esProteccionPrincipal || !token || !usuario) {
      return;
    }

    let cancelado = false;

    const validarPerfil = async () => {

      if (rolActivo !== "Practicante") {

        setPerfilCompletado(true);
        setCargandoPerfil(false);

        return;
      }

      setCargandoPerfil(true);

      try {

        const usuarioPerfil = await userRepository.getMe();

        const completado =
          usuarioPerfil
            ?.candidato
            ?.practicante
            ?.perfil_completado;

        if (!cancelado) {
          setPerfilCompletado(!!completado);
        }

      } catch (error) {

        console.error(
          "Error validando perfil del practicante:",
          error
        );

        if (!cancelado) {
          setPerfilCompletado(false);
        }

      } finally {

        if (!cancelado) {
          setCargandoPerfil(false);
        }

      }

    };

    validarPerfil();

    return () => {
      cancelado = true;
    };

  }, [token, rolActivo, esProteccionPrincipal]);


  // =====================================================
  // VALIDAR TOKEN
  // =====================================================

  if (!token || !usuario) {
    return <Navigate to="/" replace />;
  }


  // =====================================================
  // VALIDAR ROL
  // =====================================================

  if (
    roles &&
    !roles.includes(rolActivo)
  ) {
    return <Navigate to="/" replace />;
  }


  // =====================================================
  // MOSTRAR CARGANDO MIENTRAS SE VALIDA EL PERFIL
  // =====================================================

  if (
    esProteccionPrincipal &&
    rolActivo === "Practicante" &&
    (cargandoPerfil || perfilCompletado === null)
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-4">

        <div className="w-12 h-12 border-4 border-gray-300 border-t-[#e8192c] rounded-full animate-spin" />

        <p className="text-gray-600 font-medium text-sm">
          Verificando tu perfil...
        </p>

        <p className="text-gray-400 text-xs">
          Por favor, espera un momento.
        </p>

      </div>
    );
  }


  // =====================================================
  // PRACTICANTE SIN PERFIL COMPLETADO
  // =====================================================

  if (
    esProteccionPrincipal &&
    rolActivo === "Practicante" &&
    perfilCompletado === false &&
    location.pathname !== "/perfil"
  ) {
    return <Navigate to="/perfil" replace />;
  }

  return (
    <Outlet
      context={{
        perfilCompletado,
        setPerfilCompletado
      }}
    />
  );

}
