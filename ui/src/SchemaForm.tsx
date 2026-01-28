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
import DebouncedTextField from "./components/DebouncedTextField";

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
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const prevDepsRef = React.useRef<Record<string, any>>({});

  // // Flatten field configs with backend metadata
  // const flattenedFields = React.useMemo(
  //   () => fields.map((f) => ({ ...f, ...f.config })),
  //   [fields]
  // );

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

  function validate() {
    const next: Record<string, string> = {};

    fields.forEach((field) => {
      let isEffectivelyRequired = !!field.required;

      if (!isEffectivelyRequired && (field as any).requiredIf) {
        const reqIf = (field as any).requiredIf;
        const otherVal = state[reqIf.field];

        // operator-based: 'present' means other field is provided/not-empty
        if (reqIf.operator === "present") {
          const otherEmpty =
            otherVal === undefined ||
            otherVal === null ||
            (typeof otherVal === "string" && otherVal.trim() === "") ||
            (Array.isArray(otherVal) && otherVal.length === 0);
          if (!otherEmpty) isEffectivelyRequired = true;
        } else if (reqIf.operator === "equals" || reqIf.operator === undefined) {
          if (String(otherVal) === String(reqIf.value)) {
            isEffectivelyRequired = true;
          }
        }
      }

      if (!isEffectivelyRequired) return;

      const value = state[field.name];
      const isEmpty =
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "") ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) next[field.name] = `${field.label} is required`;
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  // Replace {field} placeholders in API URL template
  function resolveAPI(apiTemplate: string, state: Record<string, any>) {
    return apiTemplate.replace(/\{(\w+)\}/g, (_, key) => state[key] ?? "");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit(state);
      }}
    >
      <Stack spacing={2}>
        {fields.map((f) => {
          switch (f.type) {
            case "text":
            case "number":
              return (
                <DebouncedTextField
                  key={f.name}
                  label={f.label}
                  variant="standard"
                  type={f.type}
                  value={state[f.name] ?? (f.type === "number" ? 0 : "")}
                  required={!!f.required}
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
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
                  label={
                    <>
                      {f.label}
                      {errors[f.name] && (
                        <span style={{ color: "#d32f2f", marginLeft: 8 }}>
                          {errors[f.name]}
                        </span>
                      )}
                    </>
                  }
                />
              );

            case "select":
              return (
                <DebouncedTextField
                  key={f.name}
                  select
                  label={f.label}
                  value={state[f.name] ?? ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
                >
                  <MenuItem value="" disabled hidden>
                    Select...
                  </MenuItem>
                  {f.options?.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </DebouncedTextField>
              );

            case "dynamic-select": {
              const optionsData = dynamicOptions[f.name];
              const labelKey = f.optionLabel ?? "label";
              const valueKey = f.optionValue ?? "value";
              const isLoading = optionsData?.loading;

              const hasOptions = optionsData?.options?.length > 0;

              return (
                <DebouncedTextField
                  key={f.name}
                  select
                  label={f.label}
                  value={hasOptions ? state[f.name] ?? "" : ""}
                  onChange={(e) => handleChange(f.name, e.target.value)}
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
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
                </DebouncedTextField>
              );
            }

            case "date":
              return (
                <DebouncedTextField
                  key={f.name}
                  label={f.label}
                  type="date"
                  value={state[f.name] ?? ""}
                  onChange={(e) =>
                    setState({ ...state, [f.name]: e.target.value })
                  }
                  error={!!errors[f.name]}
                  helperText={errors[f.name]}
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
