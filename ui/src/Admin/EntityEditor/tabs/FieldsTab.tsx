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
import DebouncedTextField from "../../../components/DebouncedTextField";

const fieldTypes = [
  "text",
  "number",
  "select",
  "checkbox",
  "date",
  "dynamic-select",
];

type FieldsTabProps = {
  fields: any[];
  update: (index: number, patch: any) => void;
  add: (item: any) => void;
  remove: (index: number) => void;
};

export function FieldsTab({ fields, update, add, remove }: FieldsTabProps) {
  const updateField = (index: number, patch: any) => {
    console.log(`Updating index ${index} with patch`, patch);

    // Example: call update if that's what it's for
    update(index, patch);
  };

  return (
    <Stack spacing={2}>
      {fields.map((f, i) => (
        <Accordion key={i} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{f.label || `Field ${i + 1}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <DebouncedTextField
                label="Name"
                value={f.name || ""}
                onChange={(e) => updateField(i, { name: e.target.value })}
                size="small"
              />
              <DebouncedTextField
                label="Label"
                value={f.label || ""}
                onChange={(e) => updateField(i, { label: e.target.value })}
                size="small"
              />

              <FormControl size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={f.type || "text"}
                  label="Type"
                  onChange={(e) => updateField(i, { type: e.target.value })}
                >
                  {fieldTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={!!f.required}
                    onChange={(e) =>
                      updateField(i, { required: e.target.checked })
                    }
                  />
                }
                label="Required"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={!!f.readOnly}
                    onChange={(e) =>
                      updateField(i, { readOnly: e.target.checked })
                    }
                  />
                }
                label="Read Only"
              />

              <DebouncedTextField
                label="Depends On"
                value={f.dependsOn || ""}
                onChange={(e) => updateField(i, { dependsOn: e.target.value })}
                size="small"
              />

              {f.type === "select" && (
                <JsonEditor
                  label="Options (JSON)"
                  value={f.options}
                  onChange={(val) => updateField(i, { options: val })}
                  height={120}
                  helperText="Static select options as [{ label, value }]"
                />
              )}

              {f.type === "dynamic-select" && (
                <DebouncedTextField
                  label="Options API"
                  value={f.optionsAPI || ""}
                  onChange={(e) =>
                    updateField(i, { optionsAPI: e.target.value })
                  }
                  size="small"
                />
              )}

              {(f.type === "select" || f.type === "dynamic-select") && (
                <>
                  <DebouncedTextField
                    label="Option Label"
                    value={f.config.optionLabel || "label"}
                    onChange={(e) =>
                      updateField(i, {
                        config: {
                          ...f.config,
                          optionLabel: e.target.value,
                        },
                      })
                    }
                    size="small"
                  />
                  <DebouncedTextField
                    label="Option Value"
                    value={f.config.optionValue || "value"}
                    onChange={(e) =>
                      updateField(i, {
                        config: {
                          ...f.config,
                          optionValue: e.target.value,
                        },
                      })
                    }
                    size="small"
                  />
                </>
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
            name: "",
            label: "",
            type: "text",
            required: false,
            readOnly: false,
          })
        }
      >
        Add Field
      </Button>
    </Stack>
  );
}
