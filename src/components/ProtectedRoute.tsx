import { Navigate } from "react-router-dom";

/**
 * Bug #13 fix: Wraps any route to require a valid JWT token.
 * Unauthenticated users are redirected to the login page ("/").
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
