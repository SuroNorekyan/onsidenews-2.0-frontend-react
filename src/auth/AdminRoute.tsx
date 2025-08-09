import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { JSX } from "react";

export default function AdminRoute({ children }: { children: JSX.Element }) {
  const { token, isAdmin, isReady } = useAuth();
  if (!isReady) return null; // or a spinner
  if (!token) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
