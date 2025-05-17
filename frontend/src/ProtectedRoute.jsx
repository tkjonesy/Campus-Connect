import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ roles = [] }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
}

  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If user does not have access based on role
  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return <Navigate to={location.state?.from?.pathname || "/"} replace />;
  }

  console.log('User has access');

  return <Outlet />;
};

export default ProtectedRoute;