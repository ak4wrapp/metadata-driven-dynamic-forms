// ui/src/custom-forms/FormRenderer.tsx
import React from "react";
import { FormAData } from "./FormA";
import { FormBData } from "./FormB";
import { FormCData } from "./FormC";
import { BaseFormProps } from "../types";
import { Suspense } from "react";
import { CircularProgress } from "@mui/material";

// Data type mapping
type FormDataMap = {
  A: FormAData;
  B: FormBData;
  C: FormCData;
};

// Registry of actual components
const customFormsRegistry: {
  [K in keyof FormDataMap]: React.ComponentType<BaseFormProps<FormDataMap[K]>>;
} = {
  A: React.lazy(() => import("./FormA")),
  B: React.lazy(() => import("./FormB")),
  C: React.lazy(() => import("./FormC")),
};

// Map entity key → string registry key
export const FormKeyToComponentMap = {
  A: "FormA",
  B: "FormB",
  C: "FormC",
} as const;

interface FormRendererProps<K extends keyof FormDataMap> {
  entityKey: K;
  mode: "create" | "edit";
  data?: Partial<FormDataMap[K]>;
  onSubmit: (data: FormDataMap[K]) => Promise<void>;
}

export function FormRenderer<K extends keyof FormDataMap>({
  entityKey,
  mode,
  data,
  onSubmit,
}: FormRendererProps<K>) {
  // Step 1: get component key
  const componentKey = FormKeyToComponentMap[entityKey];

  // Step 2: get component
  const FormComponent = customFormsRegistry[
    componentKey
  ] as React.ComponentType<BaseFormProps<FormDataMap[K]>>;

  return (
    <Suspense fallback={<CircularProgress />}>
      <FormComponent mode={mode} initialData={data} onSubmit={onSubmit} />
    </Suspense>
  );
}
