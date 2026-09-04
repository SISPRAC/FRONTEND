import logo from "../../../assets/images/logo/Logo.png";
import React, { useState, useRef, useEffect } from "react";
import { logoutUseCase } from "../../../aplicacion/auth/logout.js";
import {
  useNavigate,
  useLocation
} from "react-router-dom";

import {
  HOME_ROUTES,
  PracticantePerfil_NAV
} from "./SidebarItem";

import { userRepository } from "../../../infraestructura/repository/userRepository";

import {
  UserRound,
  Settings,
  Bell,
  LogOut
} from "lucide-react";

import { jwtDecode } from "jwt-decode";


export default function Sidebar({
  navItems = [],
  footerLabel = "Usuario"
}) {

  const [openMenu, setOpenMenu] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);

  const token = localStorage.getItem("token");

  const usuario = token ? jwtDecode(token) : null;


  const [rolActivo, setRolActivo] = useState(() => {

    if (!usuario) return null;

    return (
      localStorage.getItem("rolActivo") ??
      usuario.roles?.[0]
    );

  });


  const [perfilCompletado, setPerfilCompletado] =
    useState(null);


  useEffect(() => {

    if (!usuario) return;

    if (!localStorage.getItem("rolActivo")) {

      localStorage.setItem(
        "rolActivo",
        usuario.roles[0]
      );

    }

  }, [usuario]);


  useEffect(() => {

    const cargarPerfil = async () => {

      // =========================
      // SI NO ES PRACTICANTE
      // =========================

      if (rolActivo !== "Practicante") {

        setPerfilCompletado(true);

        return;
      }

      // =========================
      // PRACTICANTE
      // =========================

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
          "Error obteniendo estado del perfil:",
          error
        );

        setPerfilCompletado(false);

      }

    };

    cargarPerfil();

  }, [rolActivo, location.pathname]);


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {

        setOpenMenu(false);

      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  const handleLogout = async () => {

    try {

      await logoutUseCase();

    } catch (error) {

      console.error(error);

    } finally {

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("rolActivo");

      navigate("/", {
        replace: true
      });

    }

  };


  const handleChangeRole = (rol) => {

    localStorage.setItem(
      "rolActivo",
      rol
    );

    setRolActivo(rol);

    setOpenMenu(false);

    navigate(
      HOME_ROUTES[rol],
      {
        replace: true
      }
    );

  };


  const navItemsFinal =
    rolActivo === "Practicante"
      ? perfilCompletado === null
        ? []
        : perfilCompletado
          ? navItems
          : PracticantePerfil_NAV
      : navItems;


  return (

    <aside className="w-[300px] h-screen sticky top-0 bg-[#e8192c] flex flex-col shadow-[4px_0_16px_rgba(232,25,44,0.18)] flex-shrink-0">

      {/* ── Área del logo ── */}

      <div className="flex items-center justify-center min-h-[80px] px-3 py-4 border-b-[3px] border-[#e8192c]">

        <img
          src={logo}
          alt="SISPRAC"
          className="h-20"
        />

      </div>


      {/* ── Navegación dinámica ── */}

      <nav className="flex-1 pt-5 flex flex-col gap-0.5">

        {navItemsFinal.map((item, i) => (

          <a
            key={i}
            href={item.href ?? "#"}
            className={[
              "flex items-center gap-3 px-5 py-[13px] mr-4 rounded-r-full",
              "text-white text-[15px] font-bold no-underline transition-colors duration-150",
              item.active
                ? "bg-white/20"
                : "hover:bg-white/10",
            ].join(" ")}
          >

            {item.icon && (

              <span className="w-[22px] h-[22px] flex items-center justify-center flex-shrink-0">

                {item.icon}

              </span>

            )}

            {item.label}

          </a>

        ))}

      </nav>


      {/* ── Pie del sidebar ── */}

      <div
        ref={menuRef}
        className="relative border-t border-white/20"
      >

        {openMenu && (

          <div
            className="
              absolute
              bottom-full
              left-3
              right-3
              mb-2
              rounded-xl
              bg-white
              shadow-xl
              overflow-hidden
            "
          >

            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Settings size={18} />
              Configuración
            </button>


            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Bell size={18} />
              Notificaciones
            </button>


            {usuario?.roles?.length > 1 && (

              <>

                <div className="border-t" />

                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                  Cambiar rol
                </div>

                {usuario.roles.map((rol) => (

                  <button
                    key={rol}
                    onClick={() => handleChangeRole(rol)}
                    className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 ${
                      rol === rolActivo
                        ? "bg-red-50 text-red-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {rol}
                  </button>

                ))}

              </>

            )}


            <div className="border-t" />


            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>

          </div>

        )}


        <div
          onClick={() => setOpenMenu(!openMenu)}
          className="
            cursor-pointer
            hover:bg-white/10
            transition-colors
            duration-150
            flex
            items-center
            justify-between
            px-5
            py-4
            text-white/80
          "
        >

          <div className="flex items-center gap-3 flex-1 min-w-0">

            <UserRound className="flex-shrink-0" />

            <div className="flex flex-col flex-1 min-w-0">

              <span
                className="font-semibold text-white truncate"
                title={`${usuario?.nombres} ${usuario?.apellidos}`}
              >
                {usuario?.nombres} {usuario?.apellidos}
              </span>

              <span
                className="text-xs text-white/60 truncate"
                title={rolActivo}
              >
                {rolActivo}
              </span>

            </div>

          </div>


          <div className="flex items-center gap-2">

            <button
              onClick={(e) => {

                e.stopPropagation();

                handleLogout();

              }}
              className="hover:text-red-300 transition-colors"
            >

              <LogOut size={18} />

            </button>

          </div>

        </div>

      </div>

    </aside>

  );

}