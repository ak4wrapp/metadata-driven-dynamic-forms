import * as React from "react";
import {
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DebouncedTextField from "../../../components/DebouncedTextField";

type EntityTabProps = {
  data: any;
  updateRoot: (key: string, value: any) => void;
  isEdit: boolean;
};

export function EntityTab({ data, updateRoot, isEdit }: EntityTabProps) {
  return (
    <Stack spacing={1}>
      <DebouncedTextField
        label="ID"
        value={data.id}
        disabled={isEdit}
        onChange={(e) => updateRoot("id", e.target.value)}
        helperText="Unique identifier for the entity"
      />

      <DebouncedTextField
        label="Title"
        value={data.title}
        onChange={(e) => updateRoot("title", e.target.value)}
        helperText="Human-readable title"
      />

      <DebouncedTextField
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
        <DebouncedTextField
          label="Component"
          value={data.component}
          onChange={(e) => updateRoot("component", e.target.value)}
          helperText="Name of the custom component to render"
        />
      )}
    </Stack>
  );
}
