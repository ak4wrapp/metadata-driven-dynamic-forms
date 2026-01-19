// ui/src/dialogs/APIActionDialog.tsx
import * as React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import { ActionConfig } from "../form-config";
import { useAPI } from "../hooks/useAPI";

export type ApiActionDialogProps = {
  action: ActionConfig;
  actionApi: string;
  method?: "POST" | "PUT" | "DELETE";
  row: any;
  dialogContent: React.ReactNode;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

export const ApiActionDialog: React.FC<ApiActionDialogProps> = ({
  action,
  actionApi,
  method = "POST",
  row,
  dialogContent,
  onClose,
}) => {
  const [loading, setLoading] = React.useState(false);
  const {
    data,
    loading: apiActionLoading,
    callAPI,
  } = useAPI("/api/admin/entities", {
    autoFetch: false,
  });
  function buildApiUrl(action, row) {
    // prefer explicit id_field, but fall back to "id"
    const primaryField = action.idField || "id";

    let idValue = row[primaryField];

    // fallback if explicit field is missing
    if (idValue === undefined || idValue === null) {
      idValue = row.id;
    }

    if (idValue === undefined || idValue === null) {
      throw new Error(`No identifier found. Tried "${primaryField}" and "id".`);
    }

    return action.api.replace("{id}", idValue);
  }

  const runApi = async () => {
    try {
      setLoading(true);
      const finalActionApi = buildApiUrl(action, row);
      console.info(row, finalActionApi);

      const result = await callAPI(finalActionApi, {
        method: method ?? "GET",
        body: method === "POST" ? JSON.stringify(row) : undefined,
        headers: { "Content-Type": "application/json" },
      });

      if (result) {
        console.log("Action succeeded:", result);
        // Optionally refresh table or show notification
      }
    } catch (err) {
      console.error("API action failed:", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
      {dialogContent && <Box>{dialogContent}</Box>}

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          onClick={runApi}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          {!loading && "Confirm"}
        </Button>
      </Box>
    </Box>
  );
};
