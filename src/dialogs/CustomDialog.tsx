import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";

type CustomDialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  loading?: boolean;
};

export const CustomDialog: React.FC<CustomDialogProps> = ({
  open,
  title,
  onClose,
  children,
  loading = false,
}) => {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          disabled={loading}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 20, verticalAlign: "middle" }}
          >
            close
          </span>
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          children
        )}
      </DialogContent>
    </Dialog>
  );
};
