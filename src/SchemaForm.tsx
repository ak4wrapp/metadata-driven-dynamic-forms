import * as React from "react";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Stack,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FieldConfig, OptionsMap } from "./types";

interface SchemaFormProps {
  fields: FieldConfig[];
  mode: "create" | "edit";
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void;
}

export default function SchemaForm({
  fields,
  initialData,
  onSubmit,
  mode,
}: SchemaFormProps) {
  const [state, setState] = React.useState(() => initialData ?? {});
  const [dynamicOptions, setDynamicOptions] = React.useState<OptionsMap>({});

  const prevDepsRef = React.useRef<Record<string, any>>({});

  React.useEffect(() => {
    fields.forEach((field) => {
      if (field.type === "dynamic-select" && field.optionsAPI) {
        const dependsOnValue = field.dependsOn ? state[field.dependsOn] : true;

        // Only fetch if dependency exists
        if (field.dependsOn && !dependsOnValue) {
          // Reset options if parent not selected
          setDynamicOptions((prev) => ({
            ...prev,
            [field.name]: { loading: false, options: [] },
          }));
          return;
        }

        // Only fetch if dependency value changed
        if (prevDepsRef.current[field.name] === dependsOnValue) return;
        prevDepsRef.current[field.name] = dependsOnValue;

        // Set loading state
        setDynamicOptions((prev) => ({
          ...prev,
          [field.name]: { loading: true, options: [] },
        }));

        const apiUrl =
          typeof field.optionsAPI === "string"
            ? resolveAPI(field.optionsAPI, state)
            : field.optionsAPI;

        fetch(apiUrl)
          .then((res) => res.json())
          .then((data) => {
            setDynamicOptions((prev) => ({
              ...prev,
              [field.name]: { loading: false, options: data },
            }));
          })
          .catch(() => {
            setDynamicOptions((prev) => ({
              ...prev,
              [field.name]: { loading: false, options: [] },
            }));
          });
      }
    });
  }, [fields, state]);

  // Handle change and reset dependents
  const handleChange = (name: string, value: any) => {
    setState((prev) => {
      const newState = { ...prev, [name]: value };

      // Reset children fields
      fields.forEach((f) => {
        if (f.dependsOn === name) {
          newState[f.name] = "";
          setDynamicOptions((prevOptions) => ({
            ...prevOptions,
            [f.name]: { loading: false, options: [] },
          }));
        }
      });

      return newState;
    });
  };

  // Replace {field} placeholders in API URL template
  function resolveAPI(apiTemplate: string, state: Record<string, any>) {
    return apiTemplate.replace(/\{(\w+)\}/g, (_, key) => state[key] ?? "");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(state);
      }}
    >
      <Stack spacing={2}>
        {fields.map((f) => {
          switch (f.type) {
            case "text":
            case "number":
              return (
                <TextField
                  key={f.name}
                  label={f.label}
                  type={f.type}
                  value={state[f.name] ?? ""}
                  required={f.required}
                  onChange={(e) =>
                    setState({
                      ...state,
                      [f.name]:
                        f.type === "number"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              );

            case "checkbox":
              return (
                <FormControlLabel
                  key={f.name}
                  control={
                    <Checkbox
                      checked={!!state[f.name]}
                      onChange={(e) =>
                        setState({ ...state, [f.name]: e.target.checked })
                      }
                      disabled={f.readOnly}
                    />
                  }
                  label={f.label}
                />
              );

            case "select":
              return (
                <TextField
                  key={f.name}
                  select
                  label={f.label}
                  value={state[f.name] ?? ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  {f.options?.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </TextField>
              );

            case "dynamic-select": {
              const optionsData = dynamicOptions[f.name];
              const labelKey = f.optionLabel ?? "label";
              const valueKey = f.optionValue ?? "value";
              const isLoading = optionsData?.loading;

              const hasOptions = optionsData?.options?.length > 0;

              return (
                <TextField
                  key={f.name}
                  select
                  label={f.label}
                  value={hasOptions ? state[f.name] ?? "" : ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                >
                  {isLoading && (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading...
                    </MenuItem>
                  )}

                  {!isLoading &&
                    optionsData?.options?.map((o) => (
                      <MenuItem key={o[valueKey]} value={o[valueKey]}>
                        {o[labelKey]}
                      </MenuItem>
                    ))}
                </TextField>
              );
            }

            case "date":
              return (
                <TextField
                  key={f.name}
                  label={f.label}
                  type="date"
                  value={state[f.name] ?? ""}
                  onChange={(e) =>
                    setState({ ...state, [f.name]: e.target.value })
                  }
                />
              );

            default:
              return null;
          }
        })}

        <Button type="submit" variant="contained">
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </Stack>
    </form>
  );
}
