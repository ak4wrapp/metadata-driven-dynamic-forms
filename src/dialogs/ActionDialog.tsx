import * as React from "react";
import { Box, CircularProgress, Dialog, DialogContent } from "@mui/material";

// Registry for custom actions
export const customActionRegistry: Record<string, (row: any) => Promise<void>> =
  {
    exportRow: async (row) => {
      console.log("Exporting row:", row);
      await new Promise((r) => setTimeout(r, 1000));
    },
    openAuditLog: async (row) => {
      console.log("Audit log for row:", row);
      await new Promise((r) => setTimeout(r, 1000));
    },
  };

export type ActionDialogProps = {
  action: { handler: string; label?: string };
  row: any;
  onClose: () => void;
  afterAction?: (updatedRow?: any) => void;
};

export function ActionDialog({ onClose, action, row }: ActionDialogProps) {
  const [loading] = React.useState(true);

  React.useEffect(() => {
    const runAction = async () => {
      if (!action?.handler) return onClose();

      const fn = customActionRegistry[action.handler];
      if (!fn) {
        console.error(`No custom action registered for ${action.handler}`);
        return onClose();
      }

      try {
        await fn(row);
      } catch (err) {
        console.error("Custom action failed:", err);
      } finally {
        onClose();
      }
    };

    runAction();
  }, [action, row, onClose]);

  return (
    <Dialog onClose={onClose} maxWidth="sm" fullWidth open>
      <DialogContent>
        {loading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              py: 4,
            }}
          >
            <CircularProgress />
            <Box>
              Please wait while we{" "}
              {action?.label
                ? `execute "${action.label}"...`
                : "execute action..."}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
