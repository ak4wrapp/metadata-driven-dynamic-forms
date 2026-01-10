// ui/src/App.tsx
import * as React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import LandingPage from "./LandingPage";
import { DynamicLanding } from "./DynamicLanding";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function App() {
  const [view, setView] = React.useState<"landing" | "dynamicLanding">(
    "landing"
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* Radio toggle */}
      <FormControl component="fieldset" sx={{ mb: 3 }}>
        <FormLabel component="legend">Select View</FormLabel>
        <RadioGroup
          row
          value={view}
          onChange={(e) =>
            setView(e.target.value as "landing" | "dynamicLanding")
          }
        >
          <FormControlLabel
            value="landing"
            control={<Radio />}
            label="Landing Page"
          />
          <FormControlLabel
            value="dynamicLanding"
            control={<Radio />}
            label="Dynamic Landing"
          />
        </RadioGroup>
      </FormControl>

      {/* Render selected view */}
      {view === "landing" ? <LandingPage /> : <DynamicLanding />}
    </Box>
  );
}
