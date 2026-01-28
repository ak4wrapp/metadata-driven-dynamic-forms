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
  // Core field properties
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  // Make this field required when another field matches a condition.
  // operator: 'equals' compares values; 'present' means the other field is provided/non-empty.
  requiredIf?: {
    field: string;
    value?: string | number | boolean;
    operator?: "equals" | "present";
  };
  readOnly?: boolean;
  options?: { label: string; value: string | number }[];
  optionsAPI?: string;
  optionLabel?: string; // default: "label"
  optionValue?: string; // default: "value"
  dependsOn?: string;
}

export type OptionsMap = Record<string, { loading: boolean; options: any[] }>;

export type Errors = Record<string, string>;
