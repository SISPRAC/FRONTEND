import { Navigate, Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ roles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  try {
    const usuario = jwtDecode(token);

    const rolActivo =
      localStorage.getItem("rolActivo") ??
      usuario.roles?.[0];

    if (roles && !roles.includes(rolActivo)) {
      return <Navigate to="/" replace />;
    }

    return <Outlet />;

  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("rolActivo");
    return <Navigate to="/" replace />;
  }
}