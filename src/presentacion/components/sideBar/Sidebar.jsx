
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
    obtenerNotificaciones
} from "../../../aplicacion/notificacion/obtenerNotificaciones.js";

import {
    notificacionRepository
} from "../../../infraestructura/repository/notificacionRepository.js";

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

const dependencias = { notificacionRepository };

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
    const [noLeidasCount, setNoLeidasCount] = useState(0);

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
    // OBTENER NOTIFICACIONES SIN LEER
    // =====================================================

    useEffect(() => {

        let activo = true;

        const cargarNotificaciones = async () => {

            try {

                const data = await obtenerNotificaciones(dependencias);

                if (!activo) return;

                const pendientes = (data ?? []).filter(
                    (n) => String(n.estado).toUpperCase() !== "LEIDA"
                ).length;

                setNoLeidasCount(pendientes);

            } catch (error) {

                console.error(
                    "Error al cargar el contador de notificaciones:",
                    error
                );

            }

        };

        cargarNotificaciones();

        return () => {
            activo = false;
        };

    }, [location.pathname, rolActivo]);

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

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
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
            localStorage.removeItem("user");

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
    // ABRIR NOTIFICACIONES
    // =====================================================

    const handleNotifications = () => {

        setOpenMenu(false);

        navigate("/notificaciones");

        if (setMobileOpen) {
            setMobileOpen(false);
        }

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

            {/* FONDO OSCURO PARA MÓVIL */}

            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="
                        fixed inset-0 z-40
                        bg-black/40
                        md:hidden
                    "
                />
            )}

            {/* SIDEBAR */}

            <aside
                className={`
                    fixed md:sticky
                    top-0 left-0
                    z-50
                    h-screen
                    bg-red-600
                    flex flex-col
                    shadow-[4px_0_16px_rgba(232,25,44,0.18)]
                    flex-shrink-0
                    transition-all duration-300 ease-in-out
                    ${sidebarWidth}
                    w-[300px]
                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }
                `}
            >

                {/* LOGO */}

                <div
                    className={`
                        relative
                        h-[80px]
                        flex-shrink-0
                        flex items-center justify-center
                        border-b border-white/15
                        transition-all duration-300
                        ${collapsed ? "px-2" : "px-4"}
                    `}
                >

                    <img
                        src={collapsed ? LogoSolo : logo}
                        alt="SISPRAC"
                        className={`
                            object-contain
                            transition-all duration-300
                            ${collapsed ? "h-16 w-16" : "h-16"}
                        `}
                    />

                    <button
                        onClick={() => setMobileOpen(false)}
                        className="
                            md:hidden
                            absolute right-4 top-4
                            w-9 h-9
                            flex items-center justify-center
                            rounded-lg
                            text-white bg-white/10
                            hover:bg-white/20
                            transition-colors
                        "
                        aria-label="Cerrar menú"
                    >
                        <X size={22} />
                    </button>

                </div>

                {/* NAVEGACIÓN */}

                <nav
                    className={`
                        flex-1
                        pt-5
                        flex flex-col
                        gap-0.5
                        overflow-y-auto
                        ${collapsed ? "items-center" : ""}
                    `}
                >

                    {rolActivo === "Practicante" && perfilCompletado === null ? (

                        <div
                            className={`
                                flex items-center gap-3
                                px-5 py-4 text-white/80
                                ${collapsed ? "justify-center px-0" : ""}
                            `}
                        >

                            <span className="
                                w-5 h-5
                                border-2 border-white/30
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
                                    flex items-center
                                    text-white text-[15px]
                                    font-bold no-underline
                                    transition-all duration-200
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
                                        w-[22px] h-[22px]
                                        flex items-center justify-center
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

                {/* PIE DEL SIDEBAR */}

                <div
                    ref={menuRef}
                    className={`
                        relative
                        border-t border-white/20
                        ${collapsed ? "px-2" : ""}
                    `}
                >

                    {/* MENÚ DE USUARIO */}

                    {openMenu && (

                        <div
                            className={`
                                absolute bottom-full mb-2
                                rounded-xl
                                bg-white
                                shadow-xl
                                overflow-hidden
                                z-[60]
                                ${collapsed
                                    ? "left-[70px] w-[220px]"
                                    : "left-3 right-3"
                                }
                            `}
                        >

                            {/* CAMBIO DE ROL */}

                            {usuario?.roles?.length > 1 && (

                                <>

                                    <div className="
                                        px-4 py-2
                                        text-xs font-semibold
                                        text-gray-500 uppercase
                                    ">
                                        Cambiar rol
                                    </div>

                                    {usuario.roles.map((rol) => (

                                        <button
                                            key={rol}
                                            onClick={() => handleChangeRole(rol)}
                                            className={`
                                                w-full flex items-center
                                                px-4 py-3 text-left
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

                                    <div className="border-t" />

                                </>

                            )}

                            {/* CERRAR SESIÓN */}

                            <button
                                onClick={handleLogout}
                                className="
                                    w-full flex items-center gap-3
                                    px-4 py-3
                                    text-red-600
                                    hover:bg-red-50
                                "
                            >
                                <LogOut size={18} />
                                Cerrar sesión
                            </button>

                        </div>

                    )}

                    {/* USUARIO Y ACCIONES */}

                    <div
                        className={`
                            flex
                            ${collapsed
                                ? "flex-col"
                                : "items-center justify-between"
                            }
                        `}
                    >

                        {/* INFORMACIÓN DEL USUARIO */}

                        <button
                            type="button"
                            onClick={() => setOpenMenu(!openMenu)}
                            className={`
                                cursor-pointer
                                hover:bg-white/10
                                transition-all duration-200
                                flex items-center
                                text-white/80
                                ${collapsed
                                    ? "justify-center px-2 py-4 w-full"
                                    : "justify-between px-5 py-4 flex-1 min-w-0"
                                }
                            `}
                        >

                            <div
                                className={`
                                    flex items-center
                                    ${collapsed
                                        ? "justify-center"
                                        : "gap-3 flex-1 min-w-0"
                                    }
                                `}
                            >

                                <UserRound className="flex-shrink-0" />

                                {!collapsed && (

                                    <div className="
                                        flex flex-col
                                        flex-1 min-w-0
                                        text-left
                                    ">

                                        <span
                                            className="
                                                font-semibold text-white
                                                truncate
                                            "
                                            title={`${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`}
                                        >
                                            {usuario?.nombres} {usuario?.apellidos}
                                        </span>

                                        <span
                                            className="
                                                text-xs text-white/60
                                                truncate
                                            "
                                            title={rolActivo}
                                        >
                                            {rolActivo}
                                        </span>

                                    </div>

                                )}

                            </div>

                        </button>

                        {/* CAMPANA Y CERRAR SESIÓN */}

                        <div
                            className={`
                                flex items-center
                                ${collapsed
                                    ? "justify-center gap-3 pb-4"
                                    : "gap-2 pr-4"
                                }
                            `}
                        >

                            {/* NOTIFICACIONES */}

                            <button
                                type="button"
                                onClick={handleNotifications}
                                title={
                                    noLeidasCount > 0
                                        ? `${noLeidasCount} notificaciones sin leer`
                                        : "Notificaciones"
                                }
                                aria-label={`Notificaciones. ${noLeidasCount} sin leer`}
                                className="
                                    relative
                                    flex items-center justify-center
                                    w-10 h-10
                                    rounded-xl
                                    text-white
                                    hover:bg-white/15
                                    transition-all duration-200
                                "
                            >

                                <Bell
                                    size={21}
                                    className={
                                        noLeidasCount > 0
                                            ? "animate-bounce"
                                            : ""
                                    }
                                />

                                {noLeidasCount > 0 && (

                                    <span
                                        className="
                                            absolute
                                            -top-1
                                            -right-1
                                            min-w-[19px]
                                            h-[19px]
                                            px-1
                                            flex items-center justify-center
                                            rounded-full
                                            bg-white
                                            text-red-600
                                            text-[10px]
                                            font-extrabold
                                            border-2 border-red-600
                                            shadow-md
                                            animate-bounce
                                        "
                                    >
                                        {noLeidasCount > 99
                                            ? "99+"
                                            : noLeidasCount}
                                    </span>

                                )}

                            </button>

                            {/* CERRAR SESIÓN */}

                            <button
                                type="button"
                                onClick={handleLogout}
                                title="Cerrar sesión"
                                aria-label="Cerrar sesión"
                                className="
                                    flex items-center justify-center
                                    w-10 h-10
                                    rounded-xl
                                    text-white/80
                                    hover:text-white
                                    hover:bg-white/15
                                    transition-all duration-200
                                "
                            >
                                <LogOut size={20} />
                            </button>

                        </div>

                    </div>

                </div>

            </aside>

        </>
    );
}
