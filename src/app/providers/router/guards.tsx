import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider/use-auth.ts";

export function ProtectedOnly() {
  const { status } = useAuth();
  const location = useLocation();

  if (status !== "authenticated") {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

export function PublicOnly() {
  const { status, user } = useAuth();

  if (status === "authenticated") {
    return (
      <Navigate
        to={user ? "/dashboard" : "/login"}
        replace
      />
    );
  }

  return <Outlet />;
}
