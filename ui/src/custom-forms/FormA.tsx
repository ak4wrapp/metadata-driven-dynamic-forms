import * as React from "react";
import { TextField, Button, Stack, Typography } from "@mui/material";
import { BaseFormProps } from "../types";
import DebouncedTextField from "../components/DebouncedTextField";

export type FormAData = {
  name: string;
  age: number;
};

export default function FormA({
  mode,
  initialData,
  onSubmit,
}: BaseFormProps<FormAData>) {
  console.log("FormA initialData: ", initialData);
  const [form, setForm] = React.useState<FormAData>({
    name: initialData?.name ?? "",
    age: initialData?.age ?? 0,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6">{mode === "create" ? "Create Form A" : "Edit Form A"}</Typography>
        <DebouncedTextField
          label="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <DebouncedTextField
          label="Age"
          type="number"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: Number(e.target.value) })}
        />

        <Button type="submit" variant="contained">
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </Stack>
    </form>
  );
}
