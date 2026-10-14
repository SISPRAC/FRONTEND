import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/sideBar/Sidebar.jsx";
import { jwtDecode } from "jwt-decode";
import { ROLE_NAV } from "../../components/sideBar/SidebarItem.jsx";
import { Menu } from "lucide-react";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const [rolActivo, setRolActivo] = useState(() => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const usuario = jwtDecode(token);

    return (
      localStorage.getItem("rolActivo") ??
      usuario?.roles?.[0] ??
      null
    );
  });

  // Mantener actualizado el rol guardado
  useEffect(() => {
    if (rolActivo) {
      localStorage.setItem("rolActivo", rolActivo);
    }
  }, [rolActivo]);

  const navItems = ROLE_NAV[rolActivo] ?? [];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        navItems={navItems}
        rolActivo={rolActivo}
        setRolActivo={setRolActivo}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={sidebarMobileOpen}
        setMobileOpen={setSidebarMobileOpen}
      />

      <main
        className="
          flex-1
          min-w-0
          overflow-y-auto
          px-4
          py-6
          sm:px-6
          sm:py-8
          lg:px-10
          lg:py-10
        "
      >
        {!sidebarMobileOpen && (
          <button
            onClick={() => setSidebarMobileOpen(true)}
            className="
              md:hidden
              fixed
              top-4
              left-4
              z-40
              w-11
              h-11
              flex
              items-center
              justify-center
              rounded-xl
              bg-[#e8192c]
              text-white
              shadow-lg
              hover:bg-[#d91729]
              transition-colors
            "
            aria-label="Abrir menú"
          >
            <Menu />
          </button>
        )}

        <Outlet />
      </main>
    </div>
  );
}