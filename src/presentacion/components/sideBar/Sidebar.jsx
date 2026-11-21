
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
        } catch {
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

        setMobileOpen?.(false);
        setOpenMenu(false);

    }, [location.pathname, setMobileOpen]);

    // =====================================================
    // CERRAR CON ESCAPE
    // =====================================================

    useEffect(() => {

        const handleEscape = (event) => {

            if (event.key === "Escape") {
                setMobileOpen?.(false);
                setOpenMenu(false);
            }

        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };

    }, [setMobileOpen]);

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
        setMobileOpen?.(false);

        navigate(HOME_ROUTES[rol], {
            replace: true
        });

    };

    // =====================================================
    // ABRIR NOTIFICACIONES
    // =====================================================

    const handleNotifications = () => {

        setOpenMenu(false);
        setMobileOpen?.(false);

        navigate("/notificaciones");

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
    // RENDERIZADO
    // =====================================================

    return (
        <>

            {/* =========================================
                FONDO OSCURO PARA MÓVIL
            ========================================= */}

            <div
                onClick={() => setMobileOpen?.(false)}
                className={`
                    fixed inset-0 z-40
                    bg-slate-950/60
                    backdrop-blur-[2px]
                    md:hidden
                    transition-opacity duration-300
                    ${mobileOpen
                        ? "opacity-100 visible"
                        : "opacity-0 invisible pointer-events-none"
                    }
                `}
            />

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside
                className={`
                    fixed md:sticky
                    top-0 left-0
                    z-50
                    h-screen
                    h-[100dvh]
                    flex flex-col
                    flex-shrink-0
                    bg-gradient-to-b from-red-600 to-red-700
                    shadow-[4px_0_24px_rgba(185,28,28,0.16)]
                    transition-all duration-300 ease-in-out

                    w-[290px]
                    ${collapsed ? "md:w-[80px]" : "md:w-[290px]"}

                    ${mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full md:translate-x-0"
                    }
                `}
            >

                {/* =====================================
                    LOGO
                ===================================== */}

                <div
                    className={`
                        relative
                        h-[80px]
                        min-h-[80px]
                        flex-shrink-0
                        flex items-center justify-center
                        border-b border-white/15
                        transition-all duration-300
                        ${collapsed ? "md:px-2" : "px-4"}
                    `}
                >

                    {/* LOGO COMPLETO */}

                    <img
                        src={logo}
                        alt="SISPRAC"
                        className={`
                            object-contain
                            h-16
                            max-w-[220px]
                            ${collapsed ? "md:hidden" : ""}
                        `}
                    />

                    {/* LOGO REDUCIDO EN ESCRITORIO */}

                    {collapsed && (

                        <img
                            src={LogoSolo}
                            alt="SISPRAC"
                            className="
                                hidden
                                md:block
                                object-contain
                                h-16
                                w-16
                            "
                        />

                    )}

                    {/* CERRAR MENÚ MÓVIL */}

                    <button
                        type="button"
                        onClick={() => setMobileOpen?.(false)}
                        className="
                            md:hidden
                            absolute right-4 top-5
                            w-9 h-9
                            flex items-center justify-center
                            rounded-xl
                            text-white
                            bg-white/10
                            hover:bg-white/20
                            active:scale-95
                            transition-all
                        "
                        aria-label="Cerrar menú"
                    >
                        <X size={21} />
                    </button>

                </div>

                {/* =====================================
                    NAVEGACIÓN
                ===================================== */}

                <nav
                    className={`
                        flex-1
                        min-h-0
                        pt-5
                        pb-4
                        flex flex-col
                        gap-1
                        overflow-y-auto
                        overflow-x-hidden
                        custom-scrollbar-sidebar
                        ${collapsed ? "md:items-center" : ""}
                    `}
                >

                    {rolActivo === "Practicante" && perfilCompletado === null ? (

                        <div
                            className={`
                                flex items-center gap-3
                                px-5 py-4 text-white/80
                                ${collapsed ? "md:justify-center md:px-0" : ""}
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
                                    group
                                    relative
                                    flex items-center
                                    flex-shrink-0
                                    text-white
                                    text-[14px]
                                    font-semibold
                                    no-underline
                                    transition-all duration-200

                                    ${collapsed
                                        ? "md:justify-center md:w-[56px] md:h-[48px] md:rounded-xl md:px-0"
                                        : "gap-3 px-5 py-[13px] mx-3 rounded-xl"
                                    }

                                    ${isActive || item.active
                                        ? "bg-white/20 shadow-sm"
                                        : "hover:bg-white/10"
                                    }
                                `}
                            >

                                {({ isActive }) => (

                                    <>

                                        <span
                                            className={`
                                                w-[22px] h-[22px]
                                                flex items-center justify-center
                                                flex-shrink-0
                                                transition-transform duration-200
                                                ${isActive
                                                    ? "scale-105"
                                                    : "group-hover:scale-110"
                                                }
                                            `}
                                        >
                                            {item.icon}
                                        </span>

                                        <span
                                            className={`
                                                truncate
                                                ${collapsed ? "md:hidden" : ""}
                                            `}
                                        >
                                            {item.label}
                                        </span>

                                        {isActive && (
                                            <span className="
                                                absolute
                                                right-2
                                                w-1.5 h-1.5
                                                rounded-full
                                                bg-white
                                                md:hidden
                                            " />
                                        )}

                                    </>

                                )}

                            </NavLink>

                        ))

                    )}

                </nav>

                {/* =====================================
                    PIE DEL SIDEBAR
                ===================================== */}

                <div
                    ref={menuRef}
                    className={`
                        relative
                        flex-shrink-0
                        border-t border-white/20
                        bg-black/[0.04]
                        ${collapsed ? "md:px-2" : ""}
                    `}
                >

                    {/* MENÚ DE USUARIO */}

                    {openMenu && (

                        <div
                            className={`
                                absolute
                                bottom-full
                                mb-2
                                rounded-xl
                                bg-white
                                shadow-2xl
                                overflow-hidden
                                z-[60]
                                border border-slate-100
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
                                        px-4 py-3
                                        text-[11px]
                                        font-bold
                                        tracking-wider
                                        text-slate-400
                                        uppercase
                                        bg-slate-50
                                    ">
                                        Cambiar rol
                                    </div>

                                    {usuario.roles.map((rol) => (

                                        <button
                                            key={rol}
                                            type="button"
                                            onClick={() => handleChangeRole(rol)}
                                            className={`
                                                w-full
                                                flex items-center
                                                px-4 py-3
                                                text-sm
                                                text-left
                                                transition-colors
                                                hover:bg-red-50
                                                ${rol === rolActivo
                                                    ? "bg-red-50 text-red-600 font-semibold"
                                                    : "text-slate-700"
                                                }
                                            `}
                                        >
                                            {rol}
                                        </button>

                                    ))}

                                    <div className="border-t border-slate-100" />

                                </>

                            )}

                            {/* CERRAR SESIÓN */}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="
                                    w-full
                                    flex items-center gap-3
                                    px-4 py-3
                                    text-sm font-semibold
                                    text-red-600
                                    hover:bg-red-50
                                    transition-colors
                                "
                            >
                                <LogOut size={18} />
                                Cerrar sesión
                            </button>

                        </div>

                    )}

                    {/* =================================
                        USUARIO Y ACCIONES
                    ================================= */}

                    <div
                        className={`
                            flex
                            ${collapsed
                                ? "md:flex-col"
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
                                active:bg-white/15
                                transition-all duration-200
                                flex items-center
                                text-white
                                min-w-0
                                ${collapsed
                                    ? "md:justify-center md:px-2 md:py-4 md:w-full"
                                    : "justify-between px-4 py-4 flex-1"
                                }
                            `}
                        >

                            <div
                                className={`
                                    flex items-center min-w-0
                                    ${collapsed
                                        ? "md:justify-center"
                                        : "gap-3 flex-1"
                                    }
                                `}
                            >

                                <UserRound
                                    size={22}
                                    className="flex-shrink-0"
                                />

                                <div
                                    className={`
                                        flex flex-col
                                        flex-1 min-w-0
                                        text-left
                                        ${collapsed ? "md:hidden" : ""}
                                    `}
                                >

                                    <span
                                        className="
                                            font-semibold
                                            text-sm
                                            text-white
                                            truncate
                                        "
                                        title={`${usuario?.nombres ?? ""} ${usuario?.apellidos ?? ""}`}
                                    >
                                        {usuario?.nombres} {usuario?.apellidos}
                                    </span>

                                    <span
                                        className="
                                            text-xs
                                            text-white/65
                                            truncate
                                        "
                                        title={rolActivo}
                                    >
                                        {rolActivo}
                                    </span>

                                </div>

                            </div>

                        </button>

                        {/* NOTIFICACIONES Y CERRAR SESIÓN */}

                        <div
                            className={`
                                flex items-center
                                ${collapsed
                                    ? "md:justify-center md:gap-3 md:pb-4"
                                    : "gap-1 pr-3"
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
                                    active:scale-95
                                    transition-all duration-200
                                    flex-shrink-0
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
                                            -top-0.5
                                            -right-0.5
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
                                    active:scale-95
                                    transition-all duration-200
                                    flex-shrink-0
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
