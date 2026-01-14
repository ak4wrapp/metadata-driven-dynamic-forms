// ui/src/schema-form/FieldRenderer.tsx
import {
  TextField,
  Checkbox,
  FormControlLabel,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FieldConfig } from "./../types";
import DebouncedTextField from "../components/DebouncedTextField";

interface Props {
  field: FieldConfig;
  value: any;
  state: Record<string, any>;
  dynamicOptions?: { loading: boolean; options: any[] };
  onChange: (name: string, value: any) => void;
  error?: string;
}

export function FieldRenderer({
  field,
  value,
  dynamicOptions,
  onChange,
  error,
}: Props) {
  switch (field.type) {
    case "text":
    case "number":
      return (
        <DebouncedTextField
          label={field.label}
          type={field.type}
          value={value ?? ""}
          required={field.required}
          error={!!error}
          helperText={error}
          onChange={(e) =>
            onChange(
              field.name,
              field.type === "number" ? Number(e.target.value) : e.target.value
            )
          }
        />
      );

    case "checkbox":
      return (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!value}
              onChange={(e) => onChange(field.name, e.target.checked)}
              disabled={field.readOnly}
            />
          }
          label={
            <>
              {field.label}
              {error && (
                <span style={{ color: "#d32f2f", marginLeft: 8 }}>{error}</span>
              )}
            </>
          }
        />
      );

    case "select":
      return (
        <DebouncedTextField
          select
          label={field.label}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          error={!!error}
          helperText={error}
        >
          {field.options?.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </DebouncedTextField>
      );

    case "dynamic-select": {
      const labelKey = field.optionLabel ?? "label";
      const valueKey = field.optionValue ?? "value";
      const isLoading = dynamicOptions?.loading;

      return (
        <DebouncedTextField
          select
          label={field.label}
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          error={!!error}
          helperText={error}
          slotProps={{
            input: {
              startAdornment: isLoading ? (
                <CircularProgress size={20} sx={{ mr: 1 }} />
              ) : undefined,
            },
          }}
        >
          {isLoading && (
            <MenuItem disabled>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Loading...
            </MenuItem>
          )}

          {!isLoading &&
            dynamicOptions?.options?.map((o) => (
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
          label={field.label}
          type="date"
          value={value ?? ""}
          onChange={(e) => onChange(field.name, e.target.value)}
          error={!!error}
          helperText={error}
          variant="standard"
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      );

    default:
      return null;
  }
}
