import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("ag-grid")) {
              return "vendor-ag-grid";
            }
            if (
              id.includes("react-router") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react-router";
            }
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("mui") || id.includes("material-ui")) {
              return "vendor-mui";
            }
            return "vendor";
          }
          if (id.includes("src/components/dialogs/")) {
            return "dialogs";
          }
          if (id.includes("src/hooks/useAPI")) {
            return "useAPI";
          }
          if (id.includes("src/Admin/")) {
            return "admin";
          }
          if (id.includes("src/DynamicLanding")) {
            return "dynamic-landing";
          }
          if (id.includes("src/components/DebouncedTextField")) {
            return "debounced-textfield";
          }
        },
      },
    },
  },
});
