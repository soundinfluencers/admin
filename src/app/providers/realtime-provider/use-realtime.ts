import { useContext } from "react";
import { RealtimeContext } from "@/app/providers/realtime-provider/realtime-context.ts";

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }

  return context;
}
