// ui/src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import AppRoute from "./AppRoute";
import { queryClient } from "./queryClient";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoute />
    </QueryClientProvider>
  );
}
