import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export const RequireAuth = ({ roles, children }) => {
  const { user, accessToken } = useAuthStore();
  const location = useLocation();
  if (!accessToken || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};
