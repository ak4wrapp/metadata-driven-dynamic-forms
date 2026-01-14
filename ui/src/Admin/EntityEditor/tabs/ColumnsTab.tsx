import * as React from "react";
import {
  Stack,
  TextField,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { JsonEditor } from "../../../components/JsonEditor";
import DebouncedTextField from "../../../components/DebouncedTextField";

type ColumnsTabProps = {
  columns: any[];
  update: (index: number, patch: any) => void;
  add: (item: any) => void;
  remove: (index: number) => void;
};

export function ColumnsTab({ columns, update, add, remove }: ColumnsTabProps) {
  return (
    <Stack spacing={2}>
      {columns.map((c, i) => (
        <Accordion key={i} defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{c.headerName || `Column ${i + 1}`}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <DebouncedTextField
                label="Header Name"
                value={c.headerName || ""}
                onChange={(e) => update(i, { headerName: e.target.value })}
                size="small"
              />
              <DebouncedTextField
                label="Field"
                value={c.field || ""}
                onChange={(e) => update(i, { field: e.target.value })}
                size="small"
              />
              <DebouncedTextField
                label="Renderer"
                value={c.renderer || ""}
                onChange={(e) => update(i, { renderer: e.target.value })}
                size="small"
              />
              <JsonEditor
                label="Renderer Params"
                value={c.rendererParams}
                onChange={(val) => update(i, { rendererParams: val })}
                height={100}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={!!c.hide}
                    onChange={(e) => update(i, { hide: e.target.checked })}
                  />
                }
                label="Hide column"
              />
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
            headerName: "",
            field: "",
            renderer: "",
            rendererParams: {},
            hide: false,
          })
        }
      >
        Add Column
      </Button>
    </Stack>
  );
}
