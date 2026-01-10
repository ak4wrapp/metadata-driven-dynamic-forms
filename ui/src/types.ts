// Base props for forms
export interface BaseFormProps<T> {
  mode: "create" | "edit";
  initialData?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
}

// Field schema for auto-generated forms
export type FieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "dynamic-select";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;

  // static select
  options?: { label: string; value: string | number }[];

  // dynamic select
  optionsAPI?: string;
  optionLabel?: string; // default: "label"
  optionValue?: string; // default: "value"

  // conditional display based on another field's value
  dependsOn?: string;

  // backend stores all metadata here
  config?: Partial<Omit<FieldConfig, "config">>;
}

export type OptionsMap = Record<string, { loading: boolean; options: any[] }>;

export type Errors = Record<string, string>;
