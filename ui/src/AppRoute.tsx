// ui/src/AppRoute.tsx
import * as React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Box, Button, ButtonGroup } from "@mui/material";

import LandingPage from "./LandingPage";
import { DynamicLanding } from "./DynamicLanding";
import { AdminEntities } from "./Admin/AdminEntities";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box sx={{ mb: 2 }}>
      <ButtonGroup variant="contained" aria-label="navigation button group">
        <Button
          color={location.pathname === "/landing" ? "primary" : "inherit"}
          onClick={() => navigate("/landing")}
        >
          Form Builder (using local config data)
        </Button>
        <Button
          color={
            location.pathname === "/dynamic-landing" ? "primary" : "inherit"
          }
          onClick={() => navigate("/dynamic-landing")}
        >
          Form Builder (using API)
        </Button>
        <Button
          color={location.pathname === "/admin" ? "primary" : "inherit"}
          onClick={() => navigate("/admin")}
        >
          Admin
        </Button>
      </ButtonGroup>
    </Box>
  );
}

export default function AppRoute() {
  return (
    <BrowserRouter>
      {/* Nav buttons above all routes */}
      <Navigation />

      <Routes>
        <Route path="/" element={<Navigate to="/dynamic-landing" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/dynamic-landing" element={<DynamicLanding />} />
        <Route path="/admin" element={<AdminEntities />} />

        {/* Optional fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
