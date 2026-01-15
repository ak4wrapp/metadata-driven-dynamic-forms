// ui/src/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // keep cache longer
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});
