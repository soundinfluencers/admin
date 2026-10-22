import { Navigate } from "react-router-dom";

import { useAuth } from "@/app/providers/auth-provider/use-auth.ts";

export function RootRedirect() {
  const { status, user } = useAuth();

  const destination =
    status === "authenticated" && user
      ? "/dashboard"
      : "/login";

  return <Navigate to={destination} replace />;
}
