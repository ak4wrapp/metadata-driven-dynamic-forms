// ui/src/App.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import AppRoute from "./AppRoute";
import { queryClient } from "./queryClient";

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <QueryClientProvider client={queryClient}>
        <AppRoute />
      </QueryClientProvider>
    </LocalizationProvider>
  );
}
