import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/app/api/query-client/query-client.ts";
import { AuthProvider } from "@/app/providers/auth-provider/auth-provider.tsx";
import { InterceptorsProvider } from "@/app/providers/interceptors-provider/interceptors-provider.tsx";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <InterceptorsProvider>
          {children}
        </InterceptorsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
