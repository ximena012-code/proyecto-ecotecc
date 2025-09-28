import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.rol === "usuario") {
    return children; // puede entrar
  }

  if (user?.rol === "admin") {
    return <Navigate to="/dashboardadmi" replace />; // 🚀 redirige al panel admin
  }

  return <Navigate to="/login" replace />;
};

export default UserRoute;
