// ui/src/schema-form/SchemaForm.tsx

import * as React from "react";
import { Stack, Button } from "@mui/material";
import { Errors, FieldConfig } from "./../types";
import { FieldRenderer } from "./FieldRenderer";
import { useDynamicOptions } from "./useDynamicOptions";

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
  const [errors, setErrors] = React.useState<Errors>({});

  const { dynamicOptions, resetOptionsForField } = useDynamicOptions(
    fields,
    state
  );

  const handleChange = (name: string, value: any) => {
    setState((prev) => {
      const next = { ...prev, [name]: value };

      // Reset dependent fields
      fields.forEach((f) => {
        if (f.dependsOn === name) {
          next[f.name] = "";
          resetOptionsForField(f.name);
        }
      });

      return next;
    });
  };

  function validate() {
    const nextErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (!field.required) return;

      const value = state[field.name];

      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
        {fields.map((field) => (
          <FieldRenderer
            key={field.name}
            field={field}
            value={state[field.name]}
            error={errors[field.name]}
            state={state}
            dynamicOptions={dynamicOptions[field.name]}
            onChange={handleChange}
          />
        ))}

        <Button type="submit" variant="contained">
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </Stack>
    </form>
  );
}
