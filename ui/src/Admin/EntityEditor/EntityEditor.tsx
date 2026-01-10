import * as React from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "dynamic-select";

type ColorOption =
  | "inherit"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type DialogOptions = {
  title: string;
  content: React.ReactNode;
};

type ActionFormConfig = {
  type: "schema" | "component";
  component?: string;
  fields?: any[];
};

type ActionConfig =
  | {
      id: string;
      label: string;
      type: "form";
      icon?: string;
      iconColor?: ColorOption;
      tooltip?: string;
      form: ActionFormConfig;
    }
  | {
      id: string;
      label: string;
      type: "api";
      dialogOptions?: DialogOptions;
      icon?: string;
      iconColor?: ColorOption;
      api: string;
      method?: "POST" | "PUT" | "DELETE";
      confirm?: boolean;
      tooltip?: string;
    }
  | {
      id: string;
      label: string;
      icon?: string;
      iconColor?: ColorOption;
      type: "custom";
      handler: string;
      tooltip?: string;
    };

type EntityEditorProps = {
  entity: any;
  onSave: (entity: any) => void;
};

export function EntityEditor({ entity, onSave }: EntityEditorProps) {
  const [tab, setTab] = React.useState(0);
  const [data, setData] = React.useState<any>({
    ...structuredClone(entity),
    columns: entity.columns || [],
    fields: entity.fields || [],
    actions: entity.actions || [],
  });

  const updateRoot = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateArrayItem = (
    key: "columns" | "fields" | "actions",
    index: number,
    patch: any
  ) => {
    setData((prev: any) => {
      const copy = [...prev[key]];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, [key]: copy };
    });
  };

  const addArrayItem = (key: "columns" | "fields" | "actions", item: any) => {
    setData((prev: any) => ({
      ...prev,
      [key]: [...prev[key], item],
    }));
  };

  const removeArrayItem = (
    key: "columns" | "fields" | "actions",
    index: number
  ) => {
    setData((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index),
    }));
  };

  const fieldTypes: FieldType[] = [
    "text",
    "number",
    "select",
    "checkbox",
    "date",
    "dynamic-select",
  ];

  const colorOptions: ColorOption[] = [
    "inherit",
    "primary",
    "secondary",
    "error",
    "info",
    "success",
    "warning",
  ];

  return (
    <Box sx={{ minWidth: 600 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Entity" />
        <Tab label="Columns" />
        <Tab label="Fields" />
        <Tab label="Actions" />
      </Tabs>

      <Divider sx={{ my: 2 }} />

      {/* -------- ENTITY TAB -------- */}
      {tab === 0 && (
        <Stack spacing={2}>
          <TextField
            label="ID"
            value={data.id}
            disabled={!!entity.id}
            onChange={(e) => updateRoot("id", e.target.value)}
            helperText="Unique identifier for the entity"
          />
          <TextField
            label="Title"
            value={data.title}
            onChange={(e) => updateRoot("title", e.target.value)}
            helperText="Human-readable title"
          />

          <TextField
            label="API"
            value={data.api}
            onChange={(e) => updateRoot("api", e.target.value)}
            helperText="Endpoint for backend operations"
          />

          <FormControl>
            <InputLabel>Form Type</InputLabel>
            <Select
              value={data.form_type}
              label="Form Type"
              onChange={(e) => updateRoot("form_type", e.target.value)}
            >
              <MenuItem value="schema">Schema</MenuItem>
              <MenuItem value="component">Component</MenuItem>
            </Select>
          </FormControl>

          {data.form_type === "component" && (
            <TextField
              label="Component"
              value={data.component ?? ""}
              onChange={(e) => updateRoot("component", e.target.value)}
              helperText="Name of the custom component to render"
            />
          )}
        </Stack>
      )}

      {/* -------- COLUMNS TAB -------- */}
      {tab === 1 && (
        <Stack spacing={2}>
          {data.columns.map((c: any, i: number) => (
            <Accordion key={i} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{c.headerName || `Column ${i + 1}`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <TextField
                    label="Header Name"
                    value={c.headerName || ""}
                    onChange={(e) =>
                      updateArrayItem("columns", i, {
                        headerName: e.target.value,
                      })
                    }
                    helperText="Displayed column header"
                    size="small"
                  />
                  <TextField
                    label="Field"
                    value={c.field || ""}
                    onChange={(e) =>
                      updateArrayItem("columns", i, { field: e.target.value })
                    }
                    helperText="Field key from entity data"
                    size="small"
                  />
                  <TextField
                    label="Renderer"
                    value={c.renderer || ""}
                    onChange={(e) =>
                      updateArrayItem("columns", i, {
                        renderer: e.target.value,
                      })
                    }
                    helperText="Optional custom renderer"
                    size="small"
                  />
                  <TextField
                    label="Renderer Params (JSON)"
                    value={JSON.stringify(c.rendererParams || {})}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        updateArrayItem("columns", i, {
                          rendererParams: parsed,
                        });
                      } catch {}
                    }}
                    helperText={`JSON parameters for renderer. e.g. {currencyField: "currency"}`}
                    size="small"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!c.hide}
                        onChange={(e) =>
                          updateArrayItem("columns", i, {
                            hide: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Hide column"
                  />
                  <Button
                    color="error"
                    onClick={() => removeArrayItem("columns", i)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button
            variant="outlined"
            onClick={() =>
              addArrayItem("columns", {
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
      )}

      {/* -------- FIELDS TAB -------- */}
      {tab === 2 && (
        <Stack spacing={2}>
          {data.fields.map((f: any, i: number) => (
            <Accordion key={i} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{f.label || `Field ${i + 1}`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <TextField
                    label="Name"
                    value={f.name || ""}
                    onChange={(e) =>
                      updateArrayItem("fields", i, { name: e.target.value })
                    }
                    helperText="Field key"
                    size="small"
                  />
                  <TextField
                    label="Label"
                    value={f.label || ""}
                    onChange={(e) =>
                      updateArrayItem("fields", i, { label: e.target.value })
                    }
                    helperText="Human-readable label"
                    size="small"
                  />
                  <FormControl size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={f.type || "text"}
                      label="Type"
                      onChange={(e) =>
                        updateArrayItem("fields", i, { type: e.target.value })
                      }
                    >
                      {fieldTypes.map((ft) => (
                        <MenuItem key={ft} value={ft}>
                          {ft}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!f.required}
                        onChange={(e) =>
                          updateArrayItem("fields", i, {
                            required: e.target.checked,
                          })
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
                          updateArrayItem("fields", i, {
                            readOnly: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Read Only"
                  />

                  <TextField
                    label="Depends On"
                    value={f.dependsOn || ""}
                    onChange={(e) =>
                      updateArrayItem("fields", i, {
                        dependsOn: e.target.value,
                      })
                    }
                    helperText="Conditionally display based on another field"
                    size="small"
                  />

                  {f.type === "select" && (
                    <TextField
                      label="Options (JSON)"
                      value={JSON.stringify(f.options || [])}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateArrayItem("fields", i, { options: parsed });
                        } catch {}
                      }}
                      helperText="Static select options as [{label,value}]"
                      size="small"
                    />
                  )}

                  {f.type === "dynamic-select" && (
                    <TextField
                      label="Options API"
                      value={f.optionsAPI || ""}
                      onChange={(e) =>
                        updateArrayItem("fields", i, {
                          optionsAPI: e.target.value,
                        })
                      }
                      helperText="Dynamic select endpoint"
                      size="small"
                    />
                  )}
                  {(f.type === "select" || f.type === "dynamic-select") && (
                    <TextField
                      label="Option Label"
                      value={f.optionLabel || "label"}
                      onChange={(e) =>
                        updateArrayItem("fields", i, {
                          optionLabel: e.target.value,
                        })
                      }
                      helperText="Label key in dynamic options"
                      size="small"
                    />
                  )}
                  {(f.type === "select" || f.type === "dynamic-select") && (
                    <TextField
                      label="Option Value"
                      value={f.optionValue || "value"}
                      onChange={(e) =>
                        updateArrayItem("fields", i, {
                          optionValue: e.target.value,
                        })
                      }
                      helperText="Value key in dynamic options"
                      size="small"
                    />
                  )}

                  <Button
                    color="error"
                    onClick={() => removeArrayItem("fields", i)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button
            variant="outlined"
            onClick={() =>
              addArrayItem("fields", {
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
      )}

      {/* -------- ACTIONS TAB -------- */}
      {tab === 3 && (
        <Stack spacing={2}>
          {data.actions.map((a: ActionConfig, i: number) => (
            <Accordion key={i} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{a.label || `Action ${i + 1}`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <TextField
                    label="Action ID"
                    value={a.id}
                    onChange={(e) =>
                      updateArrayItem("actions", i, { id: e.target.value })
                    }
                    size="small"
                  />
                  <TextField
                    label="Label"
                    value={a.label}
                    onChange={(e) =>
                      updateArrayItem("actions", i, { label: e.target.value })
                    }
                    size="small"
                  />
                  <TextField
                    label="Tooltip"
                    value={a.tooltip || ""}
                    onChange={(e) =>
                      updateArrayItem("actions", i, { tooltip: e.target.value })
                    }
                    size="small"
                  />
                  <FormControl size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={a.type}
                      label="Type"
                      onChange={(e) =>
                        updateArrayItem("actions", i, { type: e.target.value })
                      }
                    >
                      <MenuItem value="form">Form</MenuItem>
                      <MenuItem value="api">API</MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    label="Icon"
                    value={a.icon || ""}
                    onChange={(e) =>
                      updateArrayItem("actions", i, { icon: e.target.value })
                    }
                    size="small"
                    helperText="Optional icon name"
                  />

                  {a.icon && (
                    <FormControl size="small">
                      <InputLabel>Icon Color</InputLabel>
                      <Select
                        value={a.iconColor || "inherit"}
                        label="Icon Color"
                        onChange={(e) =>
                          updateArrayItem("actions", i, {
                            iconColor: e.target.value,
                          })
                        }
                      >
                        {colorOptions.map((co) => (
                          <MenuItem key={co} value={co}>
                            {co}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}

                  {a.type === "form" && (
                    <TextField
                      label="Form Component (optional)"
                      value={(a as any).form?.component || ""}
                      onChange={(e) =>
                        updateArrayItem("actions", i, {
                          form: {
                            ...(a as any).form,
                            component: e.target.value,
                          },
                        })
                      }
                      size="small"
                      helperText='Specify component if form type is "component"'
                    />
                  )}

                  {a.type === "api" && (
                    <>
                      <TextField
                        label="API Endpoint"
                        value={(a as any).api || ""}
                        onChange={(e) =>
                          updateArrayItem("actions", i, { api: e.target.value })
                        }
                        size="small"
                      />
                      <FormControl size="small">
                        <InputLabel>Method</InputLabel>
                        <Select
                          value={(a as any).method || "POST"}
                          label="Method"
                          onChange={(e) =>
                            updateArrayItem("actions", i, {
                              method: e.target.value,
                            })
                          }
                        >
                          <MenuItem value="POST">POST</MenuItem>
                          <MenuItem value="PUT">PUT</MenuItem>
                          <MenuItem value="DELETE">DELETE</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!!(a as any).confirm}
                            onChange={(e) =>
                              updateArrayItem("actions", i, {
                                confirm: e.target.checked,
                              })
                            }
                          />
                        }
                        label="Require Confirmation"
                      />
                    </>
                  )}

                  {a.type === "custom" && (
                    <TextField
                      label="Handler"
                      value={(a as any).handler || ""}
                      onChange={(e) =>
                        updateArrayItem("actions", i, {
                          handler: e.target.value,
                        })
                      }
                      size="small"
                      helperText="Function to call for custom action"
                    />
                  )}

                  <Button
                    color="error"
                    onClick={() => removeArrayItem("actions", i)}
                    size="small"
                  >
                    Remove
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}

          <Button
            variant="outlined"
            onClick={() =>
              addArrayItem("actions", {
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
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={() => onSave(data)}>
          Save Entity
        </Button>
      </Box>
    </Box>
  );
}
