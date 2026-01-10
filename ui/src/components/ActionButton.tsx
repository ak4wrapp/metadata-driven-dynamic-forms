import * as React from "react";
import { Button, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { ActionConfig } from "../form-config";

type ActionButtonProps = {
  action: ActionConfig;
  row: any;
  onClick: (action: ActionConfig, row: any) => void;
  loading?: boolean;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  row,
  onClick,
  loading = false,
}) => {
  const button = action.icon ? (
    <IconButton
      size="small"
      onClick={() => onClick(action, row)}
      color={
        (action.iconColor as
          | "inherit"
          | "primary"
          | "secondary"
          | "error"
          | "info"
          | "success"
          | "warning") ?? "primary"
      }
      disabled={loading}
    >
      {loading ? (
        <CircularProgress size={16} />
      ) : (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: 20, verticalAlign: "middle" }}
        >
          {action.icon}
        </span>
      )}
    </IconButton>
  ) : (
    <Button
      size="small"
      onClick={() => onClick(action, row)}
      disabled={loading}
    >
      {loading ? <CircularProgress size={16} /> : action.label}
    </Button>
  );

  return action.tooltip ? (
    <Tooltip title={action.tooltip}>{button}</Tooltip>
  ) : (
    button
  );
};
