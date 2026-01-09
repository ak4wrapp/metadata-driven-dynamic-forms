import * as React from "react";
import { BaseFormProps } from "../types";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Stack,
} from "@mui/material";

export type FormBData = {
  title: string;
  isActive: boolean;
};

export default function FormB({
  mode,
  initialData,
  onSubmit,
}: BaseFormProps<FormBData>) {
  const [form, setForm] = React.useState<FormBData>({
    title: initialData?.title ?? "",
    isActive: initialData?.isActive ?? false,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
    >
      <Stack spacing={2}>
        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
          }
          label="Active"
        />

        <Button type="submit" variant="contained">
          {mode === "create" ? "Create" : "Update"}
        </Button>
      </Stack>
    </form>
  );
}
