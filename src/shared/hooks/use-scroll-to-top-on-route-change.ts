import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToTopOnRouteChange = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [pathname]);
};
