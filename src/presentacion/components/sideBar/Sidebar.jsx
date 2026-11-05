import logo from "../../../assets/images/logo/Logo.png";
import LogoSolo from "../../../assets/images/logo/solo_logo.png";

import React, {
  useState,
  useRef,
  useEffect
} from "react";

import {
  logoutUseCase
} from "../../../aplicacion/auth/logout.js";

import {
  useNavigate,
  useLocation,
  NavLink
} from "react-router-dom";

import {
  HOME_ROUTES,
  PracticantePerfil_NAV
} from "./SidebarItem";


import {
  UserRound,
  Bell,
  LogOut,
  X
} from "lucide-react";

import {
  jwtDecode
} from "jwt-decode";


export default function Sidebar({
  navItems = [],
  footerLabel = "Usuario",
  rolActivo,
  setRolActivo,
  collapsed = false,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
  perfilCompletado,
  setPerfilCompletado
}) {

  const [openMenu, setOpenMenu] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);


  // =====================================================
  // OBTENER USUARIO DEL TOKEN
  // =====================================================

  const token = localStorage.getItem("token");

  const usuario = React.useMemo(() => {

    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }

  }, [token]);


  // =====================================================
  // CERRAR MENÚ AL HACER CLICK AFUERA
  // =====================================================

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


  // =====================================================
  // CERRAR SIDEBAR MÓVIL AL CAMBIAR DE RUTA
  // =====================================================

  useEffect(() => {

    if (setMobileOpen) {

      setMobileOpen(false);

    }

  }, [location.pathname, setMobileOpen]);


  // =====================================================
  // LOGOUT
  // =====================================================

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


  // =====================================================
  // CAMBIAR ROL
  // =====================================================

  const handleChangeRole = (rol) => {

    setRolActivo(rol);

    localStorage.setItem("rolActivo", rol);

    // Permitir que ProtectedRoute vuelva a validar el perfil
    // únicamente cuando se cambia al rol Practicante.
    if (setPerfilCompletado) {
      setPerfilCompletado(
        rol === "Practicante" ? null : true
      );
    }

    setOpenMenu(false);

    if (setMobileOpen) {
      setMobileOpen(false);
    }

    navigate(HOME_ROUTES[rol], {
      replace: true
    });

  };


  // =====================================================
  // NAVEGACIÓN FINAL
  // =====================================================

  const navItemsFinal =
    rolActivo === "Practicante"
      ? perfilCompletado === null
        ? []
        : perfilCompletado
          ? navItems
          : PracticantePerfil_NAV
      : navItems;


  // =====================================================
  // CLASES DINÁMICAS
  // =====================================================

  const sidebarWidth = collapsed
    ? "md:w-[80px]"
    : "md:w-[300px]";


  return (

    <>

      {/* =====================================================
          FONDO OSCURO PARA MÓVIL
      ===================================================== */}

      {mobileOpen && (

        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-black/40
            md:hidden
          "
        />

      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`
          fixed
          md:sticky
          top-0
          left-0
          z-50
          h-screen
          bg-red-600
          flex
          flex-col
          shadow-[4px_0_16px_rgba(232,25,44,0.18)]
          flex-shrink-0
          transition-all
          duration-300
          ease-in-out
          ${sidebarWidth}
          w-[300px]
          ${mobileOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }
        `}
      >

        {/* =================================================
            ÁREA SUPERIOR / LOGO
            (misma altura fija que el TopBar: 97.5px)
        ================================================= */}

        <div
          className={`
            relative
            h-[80px]
            flex-shrink-0
            flex
            items-center
            justify-center
            border-b
            border-white/15
            transition-all
            duration-300
            ${collapsed ? "px-2" : "px-4"}
          `}
        >

          {/* LOGO */}

          <img
            src={collapsed ? LogoSolo : logo}
            alt="SISPRAC"
            className={`
              object-contain
              transition-all
              duration-300
              ${collapsed
                ? "h-16 w-16"
                : "h-16"
              }
            `}
          />


          {/* BOTÓN CERRAR MÓVIL */}

          <button
            onClick={() => setMobileOpen(false)}
            className="
              md:hidden
              absolute
              right-4
              top-4
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-lg
              text-white
              bg-white/10
              hover:bg-white/20
              transition-colors
            "
            aria-label="Cerrar menú"
          >

            <X size={22} />

          </button>

        </div>


        {/* =================================================
            NAVEGACIÓN
        ================================================= */}

        <nav
          className={`
            flex-1
            pt-5
            flex
            flex-col
            gap-0.5
            overflow-y-auto
            ${collapsed
              ? "items-center"
              : ""
            }
          `}
        >

          {rolActivo === "Practicante" && perfilCompletado === null ? (

            <div
              className={`
                flex
                items-center
                gap-3
                px-5
                py-4
                text-white/80
                ${collapsed ? "justify-center px-0" : ""}
              `}
            >

              <span className="
                w-5
                h-5
                border-2
                border-white/30
                border-t-white
                rounded-full
                animate-spin
                flex-shrink-0
              " />

              {!collapsed && (
                <span className="text-sm">
                  Verificando perfil...
                </span>
              )}

            </div>

          ) : (

            navItemsFinal.map((item, i) => (

              <NavLink
                key={item.href ?? item.label ?? i}
                to={item.href}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `
                  flex
                  items-center
                  text-white
                  text-[15px]
                  font-bold
                  no-underline
                  transition-all
                  duration-200
                  ${collapsed
                    ? "justify-center w-[56px] h-[48px] rounded-xl px-0"
                    : "gap-3 px-5 py-[13px] mr-4 rounded-r-full"
                  }
                  ${isActive || item.active
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                  }
                `}
              >

                {item.icon && (

                  <span className="
                    w-[22px]
                    h-[22px]
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  ">
                    {item.icon}
                  </span>

                )}

                {!collapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}

              </NavLink>

            ))

          )}

        </nav>


        {/* =====================================================
            PIE DEL SIDEBAR
        ===================================================== */}

        <div
          ref={menuRef}
          className={`
            relative
            border-t
            border-white/20
            ${collapsed
              ? "px-2"
              : ""
            }
          `}
        >

          {/* MENÚ EMERGENTE */}

          {openMenu && (

            <div
              className={`
                absolute
                bottom-full
                mb-2
                rounded-xl
                bg-white
                shadow-xl
                overflow-hidden
                ${collapsed
                  ? "left-[70px] w-[220px]"
                  : "left-3 right-3"
                }
              `}
            >

              {/* NOTIFICACIONES */}

              <button
                onClick={() => {

                  setOpenMenu(false);

                  navigate("/notificaciones");

                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-gray-700
                  hover:bg-gray-100
                "
              >

                <Bell size={18} />

                Notificaciones

              </button>


              {/* CAMBIO DE ROL */}

              {usuario?.roles?.length > 1 && (

                <>

                  <div className="border-t" />

                  <div
                    className="
                      px-4
                      py-2
                      text-xs
                      font-semibold
                      text-gray-500
                      uppercase
                    "
                  >

                    Cambiar rol

                  </div>

                  {usuario.roles.map((rol) => (

                    <button
                      key={rol}
                      onClick={() => handleChangeRole(rol)}
                      className={`
                        w-full
                        flex
                        items-center
                        px-4
                        py-3
                        text-left
                        hover:bg-gray-100
                        ${rol === rolActivo
                          ? "bg-red-50 text-red-600 font-semibold"
                          : "text-gray-700"
                        }
                      `}
                    >

                      {rol}

                    </button>

                  ))}

                </>

              )}


              <div className="border-t" />


              {/* CERRAR SESIÓN */}

              <button
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-red-600
                  hover:bg-red-50
                "
              >

                <LogOut size={18} />

                Cerrar sesión

              </button>

            </div>

          )}


          {/* USUARIO */}

          <div
            onClick={() => setOpenMenu(!openMenu)}
            className={`
              cursor-pointer
              hover:bg-white/10
              transition-all
              duration-200
              flex
              items-center
              text-white/80
              ${collapsed
                ? "justify-center px-2 py-4"
                : "justify-between px-5 py-4"
              }
            `}
          >

            <div
              className={`
                flex
                items-center
                ${collapsed
                  ? "justify-center"
                  : "gap-3 flex-1 min-w-0"
                }
              `}
            >

              <UserRound className="flex-shrink-0" />


              {!collapsed && (

                <div
                  className="
                    flex
                    flex-col
                    flex-1
                    min-w-0
                  "
                >

                  <span
                    className="
                      font-semibold
                      text-white
                      truncate
                    "
                    title={`${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`}
                  >

                    {usuario?.nombres}
                    {" "}
                    {usuario?.apellidos}

                  </span>


                  <span
                    className="
                      text-xs
                      text-white/60
                      truncate
                    "
                    title={rolActivo}
                  >

                    {rolActivo}

                  </span>

                </div>

              )}

            </div>


            {/* LOGOUT RÁPIDO */}

            {!collapsed && (

              <div className="flex items-center">

                <button
                  onClick={(e) => {

                    e.stopPropagation();

                    handleLogout();

                  }}
                  className="
                    hover:text-red-300
                    transition-colors
                    p-1
                  "
                  aria-label="Cerrar sesión"
                >

                  <LogOut size={18} />

                </button>

              </div>

            )}

          </div>

        </div>

      </aside>

    </>

  );

}