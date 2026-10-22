import { Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/auth-provider/use-auth.ts";
import { Loader } from "@/shared/ui/v2/loader";

import s from "./app-initialization-boundary.module.scss";

export const AppInitializationBoundary = () => {
  const { isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className={s.screen}>
        <Loader label="Initializing application…" />
      </div>
    );
  }

  return <Outlet />;
};
