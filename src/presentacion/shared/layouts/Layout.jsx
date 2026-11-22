
import { useState, useEffect } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Sidebar from "../../components/sideBar/Sidebar.jsx";
import TopBar from "../../components/sideBar/TopBar.jsx";
import { jwtDecode } from "jwt-decode";
import { ROLE_NAV } from "../../components/sideBar/SidebarItem.jsx";
import { Menu } from "lucide-react";

export default function Layout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

    // Recibir el estado compartido desde ProtectedRoute.
    const {
        perfilCompletado,
        setPerfilCompletado
    } = useOutletContext();

    const [rolActivo, setRolActivo] = useState(() => {
        const token = localStorage.getItem("token");

        if (!token) return null;

        try {
            const usuario = jwtDecode(token);

            return (
                localStorage.getItem("rolActivo") ??
                usuario?.roles?.[0] ??
                null
            );
        } catch {
            return null;
        }
    });

    useEffect(() => {
        if (rolActivo) {
            localStorage.setItem("rolActivo", rolActivo);
        }
    }, [rolActivo]);

    // Bloquear scroll del documento cuando el menú móvil está abierto.
    useEffect(() => {
        document.body.style.overflow = sidebarMobileOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarMobileOpen]);

    // Cerrar menú móvil con Escape.
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setSidebarMobileOpen(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const navItems = ROLE_NAV[rolActivo] ?? [];

    return (
        <div className="
            flex
            w-full
            h-screen
            h-[100dvh]
            overflow-hidden
            bg-slate-100
        ">

            <Sidebar
                navItems={navItems}
                rolActivo={rolActivo}
                setRolActivo={setRolActivo}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                mobileOpen={sidebarMobileOpen}
                setMobileOpen={setSidebarMobileOpen}
                perfilCompletado={perfilCompletado}
                setPerfilCompletado={setPerfilCompletado}
            />

            <div className="
                flex-1
                min-w-0
                min-h-0
                h-full
                flex
                flex-col
                overflow-hidden
            ">

                <TopBar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                <main className="
                    flex-1
                    min-w-0
                    min-h-0
                    overflow-y-auto
                    overflow-x-hidden
                    overscroll-y-contain
                    px-4
                    py-6
                    sm:px-6
                    sm:py-8
                    lg:px-10
                    lg:py-10
                ">

                    {!sidebarMobileOpen && (
                        <button
                            type="button"
                            onClick={() => setSidebarMobileOpen(true)}
                            className="
                                md:hidden
                                fixed
                                top-4
                                left-4
                                z-30
                                w-11
                                h-11
                                shrink-0
                                flex
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#e8192c]
                                text-white
                                shadow-lg
                                shadow-red-600/20
                                hover:bg-[#d91729]
                                active:scale-95
                                transition-all
                                duration-200
                            "
                            aria-label="Abrir menú de navegación"
                            aria-expanded={sidebarMobileOpen}
                        >
                            <Menu size={23} />
                        </button>
                    )}

                    {/* Transmitir el contexto a las páginas internas. */}
                    <Outlet
                        context={{
                            perfilCompletado,
                            setPerfilCompletado
                        }}
                    />

                </main>
            </div>
        </div>
    );
}
