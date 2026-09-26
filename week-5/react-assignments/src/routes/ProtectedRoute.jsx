import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

function LoadingScreen({ message = "Checking authentication..." }) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>{message}</p>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles, redirectTo = "/login" }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export function PublicRoute({ children, redirectTo = "/dashboard" }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;
