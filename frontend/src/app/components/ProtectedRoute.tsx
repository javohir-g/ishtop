import { Navigate, useLocation } from "react-router";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");

  if (!token) {
    // Redirect to auth page if not logged in
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    // Role not allowed (e.g. seeker trying to access kindergarten panel)
    const redirectPath = userRole === "kindergarten_employer" ? "/kindergarten" : "/app";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
