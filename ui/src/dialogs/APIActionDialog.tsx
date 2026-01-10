// ui/src/dialogs/APIActionDialog.tsx
import * as React from "react";
import { Box, Button, CircularProgress } from "@mui/material";

export type ApiActionDialogProps = {
  actionApi: string;
  method?: "POST" | "PUT" | "DELETE";
  row: any;
  dialogContent: React.ReactNode;
  onClose: () => void;
  onSuccess?: (data: any) => void;
};

export const ApiActionDialog: React.FC<ApiActionDialogProps> = ({
  actionApi,
  method = "POST",
  row,
  dialogContent,
  onClose,
}) => {
  const [loading, setLoading] = React.useState(false);

  const runApi = async () => {
    try {
      setLoading(true);
      await fetch(actionApi, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });
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
