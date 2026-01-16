import { FormDefinition } from "./form-config";
import { formRegistry } from "./form-registry";
import React from "react";
import { CircularProgress } from "@mui/material";

interface DynamicFormProps {
  form: FormDefinition;
  mode: "create" | "edit";
  initialData?: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
}

export function DynamicForm({
  form,
  mode,
  initialData,
  onSubmit,
}: DynamicFormProps) {
  if (form.type === "component") {
    const ComponentKey = form.component as keyof typeof formRegistry;
    const CustomForm = formRegistry[ComponentKey];

    if (!CustomForm) {
      return <div>Form component {ComponentKey} not found</div>;
    }

    return (
      <CustomForm mode={mode} initialData={initialData} onSubmit={onSubmit} />
    );
  }

  const LazySchemaForm2 = React.lazy(() => import("./SchemaForm"));

  return (
    <React.Suspense fallback={<CircularProgress />}>
      <LazySchemaForm2
        fields={form.fields}
        mode={mode}
        initialData={initialData}
        onSubmit={onSubmit}
      />
    </React.Suspense>
  );
}
