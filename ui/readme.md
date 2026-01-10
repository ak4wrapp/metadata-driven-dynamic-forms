# Demo 👍
https://metadata-driven-dynamic-forms.vercel.app/

# 🎯 Goal

- **Simple entities** → generated from config
- **Complex entities** → custom React form
- Same `FormRenderer` API
- Strong typing (TS)
- React 19 compatible

---

## 1️⃣ Define a Field Schema (Form Metadata)

```ts
export type FieldType = "text" | "number" | "select" | "checkbox" | "date";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readOnly?: boolean;
  options?: { label: string; value: string }[];
}
```

---

## 2️⃣ Entity Configuration (Grid + Form Together)

```ts
export const entityConfig = {
  A: {
    api: '/api/a',
    columns: [...],
    form: {
      type: 'schema',
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'age', label: 'Age', type: 'number' },
      ],
    },
  },

  B: {
    api: '/api/b',
    columns: [...],
    form: {
      type: 'component',
      component: FormB,
    },
  },
} as const;
```

This is the **key decision point**.

---

## 3️⃣ Auto-Generated Form (Schema Based)

```tsx
interface SchemaFormProps {
  fields: FieldConfig[];
  mode: "create" | "edit";
  initialData?: Record<string, any>;
  onSubmit: (data: any) => void;
}

export function SchemaForm({ fields, initialData, onSubmit }: SchemaFormProps) {
  const [state, setState] = React.useState(() => initialData ?? {});

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(state);
      }}
    >
      {fields.map((f) => (
        <div key={f.name}>
          <label>{f.label}</label>

          {f.type === "text" && (
            <input
              value={state[f.name] ?? ""}
              onChange={(e) => setState({ ...state, [f.name]: e.target.value })}
            />
          )}

          {f.type === "number" && (
            <input
              type="number"
              value={state[f.name] ?? ""}
              onChange={(e) =>
                setState({ ...state, [f.name]: +e.target.value })
              }
            />
          )}

          {f.type === "select" && (
            <select
              value={state[f.name]}
              onChange={(e) => setState({ ...state, [f.name]: e.target.value })}
            >
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}

      <button type="submit">Save</button>
    </form>
  );
}
```

---

## 4️⃣ Unified Form Renderer (Magic Happens Here)

```tsx
interface DynamicFormProps {
  entityKey: keyof typeof entityConfig;
  mode: "create" | "edit";
  data?: any;
  onSubmit: (payload: any) => Promise<void>;
}

export function DynamicForm({
  entityKey,
  mode,
  data,
  onSubmit,
}: DynamicFormProps) {
  const formConfig = entityConfig[entityKey].form;

  if (formConfig.type === "component") {
    const CustomForm = formConfig.component;
    return <CustomForm mode={mode} initialData={data} onSubmit={onSubmit} />;
  }

  return (
    <SchemaForm
      fields={formConfig.fields}
      mode={mode}
      initialData={data}
      onSubmit={onSubmit}
    />
  );
}
```

---

## 5️⃣ Usage from Grid / Route (No Change)

```tsx
<DynamicForm
  entityKey={routeKey}
  mode={selectedRow ? "edit" : "create"}
  data={selectedRow}
  onSubmit={(payload) =>
    selectedRow
      ? updateEntity(routeKey, payload)
      : createEntity(routeKey, payload)
  }
/>
```

---

## 6️⃣ Why This Is the Sweet Spot

✅ One renderer
✅ Metadata-first
✅ Zero boilerplate for simple entities
✅ Unlimited customization when needed
✅ Easy to enforce permissions, defaults, read-only
✅ Aligns with enterprise React patterns

---

## 7️⃣ Next Logical Enhancements (Pick One)

1. 🔐 **Permissions / role-based field visibility**
2. 🧠 **Share grid column config → form config**
3. ✅ **Zod validation from same schema**
4. 🧩 **Form sections / tabs**
5. 🚀 **Server-driven form config**
6. ⚡ **React Hook Form version (performance)**

Tell me which one you want next and I’ll build it on top of this exact structure.
