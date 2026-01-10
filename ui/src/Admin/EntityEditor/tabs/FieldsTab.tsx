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
  return (
    <Stack spacing={2}>
      {fields.map((f, i) => (
        <Accordion key={i} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{f.label || `Field ${i + 1}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <TextField
                label="Name"
                value={f.name || ""}
                onChange={(e) => update(i, { name: e.target.value })}
                size="small"
              />
              <TextField
                label="Label"
                value={f.label || ""}
                onChange={(e) => update(i, { label: e.target.value })}
                size="small"
              />

              <FormControl size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={f.type || "text"}
                  label="Type"
                  onChange={(e) => update(i, { type: e.target.value })}
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
                    onChange={(e) => update(i, { required: e.target.checked })}
                  />
                }
                label="Required"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={!!f.readOnly}
                    onChange={(e) => update(i, { readOnly: e.target.checked })}
                  />
                }
                label="Read Only"
              />

              <TextField
                label="Depends On"
                value={f.dependsOn || ""}
                onChange={(e) => update(i, { dependsOn: e.target.value })}
                size="small"
              />

              {f.type === "select" && (
                <JsonEditor
                  label="Options (JSON)"
                  value={f.options}
                  onChange={(val) => update(i, { options: val })}
                  height={120}
                  helperText="Static select options as [{ label, value }]"
                />
              )}

              {f.type === "dynamic-select" && (
                <TextField
                  label="Options API"
                  value={f.optionsAPI || ""}
                  onChange={(e) => update(i, { optionsAPI: e.target.value })}
                  size="small"
                />
              )}

              {(f.type === "select" || f.type === "dynamic-select") && (
                <>
                  <TextField
                    label="Option Label"
                    value={f.optionLabel || "label"}
                    onChange={(e) => update(i, { optionLabel: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Option Value"
                    value={f.optionValue || "value"}
                    onChange={(e) => update(i, { optionValue: e.target.value })}
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
