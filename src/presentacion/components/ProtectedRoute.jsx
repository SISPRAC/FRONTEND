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


  const [perfilCompletado, setPerfilCompletado] =
    useState(null);

  const [cargandoPerfil, setCargandoPerfil] =
    useState(false);


  let usuario = null;

  try {

    if (token) {
      usuario = jwtDecode(token);
    }

  } catch (error) {

    localStorage.removeItem("token");
    localStorage.removeItem("rolActivo");

  }


  const rolActivo =
    usuario
      ? localStorage.getItem("rolActivo") ??
        usuario.roles?.[0]
      : null;


  useEffect(() => {

    const validarPerfil = async () => {

      // =========================
      // NO ES PRACTICANTE
      // =========================

      if (rolActivo !== "Practicante") {

        setPerfilCompletado(true);
        setCargandoPerfil(false);

        return;
      }


      // =========================
      // VALIDAR PRACTICANTE
      // =========================

      setCargandoPerfil(true);

      try {

        const usuarioPerfil =
          await userRepository.getMe();


        const completado =
          usuarioPerfil
            ?.candidato
            ?.practicante
            ?.perfil_completado;


        setPerfilCompletado(!!completado);

      } catch (error) {

        console.error(
          "Error validando perfil del practicante:",
          error
        );

        setPerfilCompletado(false);

      } finally {

        setCargandoPerfil(false);

      }

    };


    validarPerfil();

  }, [rolActivo, location.pathname]);


  // =========================
  // VALIDAR TOKEN
  // =========================

  if (!token || !usuario) {

    return <Navigate to="/" replace />;

  }


  // =========================
  // VALIDAR ROL
  // =========================

  if (
    roles &&
    !roles.includes(rolActivo)
  ) {

    return <Navigate to="/" replace />;

  }


  // =========================
  // ESPERAR VALIDACIÓN
  // =========================

  if (cargandoPerfil) {

    return null;

  }


  // =========================
  // PRACTICANTE SIN PERFIL
  // =========================

  if (
    rolActivo === "Practicante" &&
    !perfilCompletado &&
    location.pathname !== "/perfil"
  ) {

    return (
      <Navigate
        to="/perfil"
        replace
      />
    );

  }


  return <Outlet />;

}