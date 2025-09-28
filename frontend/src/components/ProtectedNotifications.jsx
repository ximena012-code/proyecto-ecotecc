import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificacionesAdmin from "../pages/NotificacionesAdmin";
import NotificacionesUsuario from "../pages/NotificacionesUsuario";

const ProtectedNotifications = () => {
  const { user, token } = useAuth();

  if (!token || !user) return <Navigate to="/login" />;

  if (user.rol === "admin") return <NotificacionesAdmin />;
  if (user.rol === "usuario") return <NotificacionesUsuario />;

  return <Navigate to="/login" />;
};

export default ProtectedNotifications;