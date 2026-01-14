import * as React from "react";
import { TextField, Button, Stack } from "@mui/material";
import { BaseFormProps } from "../types";
import DebouncedTextField from "../components/DebouncedTextField";

export type FormCData = {
  description: string;
  quantity: number;
};

export default function FormC({
  mode,
  initialData,
  onSubmit,
}: BaseFormProps<FormCData>) {
  const [form, setForm] = React.useState<FormCData>({
    description: initialData?.description ?? "",
    quantity: initialData?.quantity ?? 0,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Stack spacing={2}>
        <DebouncedTextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          fullWidth
        />

        <DebouncedTextField
          label="Quantity"
          type="number"
          value={form.quantity}
          onChange={(e) =>
            setForm({
              ...form,
              quantity: Number(e.target.value),
            })
          }
          fullWidth
        />

        <Button type="submit" variant="contained">
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </Stack>
    </form>
  );
}
