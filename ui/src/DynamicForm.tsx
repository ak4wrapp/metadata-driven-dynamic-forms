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
  if (form.formType === "component") {
    /**
     * Load custom form component from registry
     *  @remarks
     * The `keyof typeof formRegistry` type assertion ensures that the `ComponentKey` variable is typed as one of the keys of the `formRegistry` object. This provides type safety when accessing the registry.
     *  @example
     * const formRegistry = {
     *   CustomFormA: CustomFormAComponent,
     *   CustomFormB: CustomFormBComponent,
     * };
     *
     * const ComponentKey = "CustomFormA" as keyof typeof formRegistry;
     * const CustomForm = formRegistry[ComponentKey];
     *
     * // Now CustomForm is typed as CustomFormAComponent
     */
    const ComponentKey = form.component as keyof typeof formRegistry;
    const CustomForm = formRegistry[ComponentKey];

    if (!CustomForm) {
      return <div>Form component {ComponentKey} not found</div>;
    }

    /**
     * Render the custom form component based on the form definition
     * @remarks
     * The `CustomForm` component is rendered with the provided `mode`, `initialData`, and `onSubmit` props. This allows for dynamic rendering of different form components based on the form definition.
     * @example
     * <CustomForm mode="create" initialData={{}} onSubmit={handleSubmit} />
     * @see {@link formRegistry} for available form components.
     */
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
