import * as React from "react";
import {
  Stack,
  TextField,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { JsonEditor } from "../../../components/JsonEditor";

const colorOptions = [
  "inherit",
  "primary",
  "secondary",
  "error",
  "info",
  "success",
  "warning",
];

type ActionsTabProps = {
  actions: any[];
  update: (index: number, patch: any) => void;
  add: (item: any) => void;
  remove: (index: number) => void;
};

export function ActionsTab({ actions, update, add, remove }: ActionsTabProps) {
  return (
    <Stack spacing={2}>
      {actions.map((a, i) => (
        <Accordion key={i} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{a.label || `Action ${i + 1}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <TextField
                label="Action ID"
                value={a.id || ""}
                onChange={(e) => update(i, { id: e.target.value })}
                size="small"
              />
              <TextField
                label="Label"
                value={a.label || ""}
                onChange={(e) => update(i, { label: e.target.value })}
                size="small"
              />
              <TextField
                label="Tooltip"
                value={a.tooltip || ""}
                onChange={(e) => update(i, { tooltip: e.target.value })}
                size="small"
              />

              <FormControl size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={a.type}
                  label="Type"
                  onChange={(e) => update(i, { type: e.target.value })}
                >
                  <MenuItem value="form">Form</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Icon"
                value={a.icon || ""}
                onChange={(e) => update(i, { icon: e.target.value })}
                size="small"
              />

              {a.icon && (
                <FormControl size="small">
                  <InputLabel>Icon Color</InputLabel>
                  <Select
                    value={a.iconColor || "inherit"}
                    label="Icon Color"
                    onChange={(e) => update(i, { iconColor: e.target.value })}
                  >
                    {colorOptions.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {a.type === "form" && (
                <TextField
                  label="Form Component"
                  value={a.form?.component || ""}
                  onChange={(e) =>
                    update(i, {
                      form: { ...a.form, component: e.target.value },
                    })
                  }
                  size="small"
                />
              )}

              {a.type === "api" && (
                <>
                  <TextField
                    label="API Endpoint"
                    value={a.api || ""}
                    onChange={(e) => update(i, { api: e.target.value })}
                    size="small"
                  />
                  <FormControl size="small">
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={a.method || "POST"}
                      label="Method"
                      onChange={(e) => update(i, { method: e.target.value })}
                    >
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!a.confirm}
                        onChange={(e) =>
                          update(i, { confirm: e.target.checked })
                        }
                      />
                    }
                    label="Require Confirmation"
                  />
                  {a.confirm && (
                    <JsonEditor
                      label="Dialog Options (Json)"
                      value={a.dialogOptions || {}}
                      onChange={(newValue) =>
                        update(i, { dialogOptions: newValue })
                      }
                      helperText={`Dialog Content your want to display in the confirmation dialog. 
                        e.g. {
                          "content": "Are you sure you want to deactivate this item?",
                          "title": "Deactivate Item"
                        }"`}
                    />
                  )}
                </>
              )}

              {a.type === "custom" && (
                <TextField
                  label="Handler"
                  value={a.handler || ""}
                  onChange={(e) => update(i, { handler: e.target.value })}
                  size="small"
                />
              )}

              <Button color="error" onClick={() => remove(i)} size="small">
                Remove
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>
      ))}

      <Button
        variant="outlined"
        onClick={() =>
          add({
            id: "",
            label: "",
            type: "form",
            form: { type: "schema", fields: [] },
          })
        }
      >
        Add Action
      </Button>
    </Stack>
  );
}
