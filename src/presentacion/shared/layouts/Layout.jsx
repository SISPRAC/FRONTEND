import Sidebar from "../../components/sideBar/Sidebar.jsx";
import { jwtDecode } from "jwt-decode";
import { ROLE_NAV } from "../../components/sideBar/SidebarItem.jsx";

export default function Layout({
  children
}) {
  const token = localStorage.getItem("token");

  const usuario = token ? jwtDecode(token) : null;

  const rolActivo =
    localStorage.getItem("rolActivo") ??
    usuario?.roles?.[0];

  const navItems = ROLE_NAV[rolActivo] ?? [];

  return (
    <div className="flex min-h-screen bg-slate-100">

      <Sidebar
        navItems={navItems}
      />

      <main className="flex-1 px-11 py-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}