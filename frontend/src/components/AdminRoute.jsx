import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, token } = useAuth();

  if (token && user?.rol === "admin") {
    return children;
  }

  return <Navigate to="/login" />;
};

export default AdminRoute;