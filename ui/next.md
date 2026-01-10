Ah, yes — if you want the **checkbox to call a backend API dynamically**, you have a few options. Ideally, it should be configurable per column via your `formConfig`, so it’s fully backend-driven.

Here’s how you can structure it.

---

### 1️⃣ Extend your `ColumnConfig` type

Add an optional `onChangeApi` (or generic `api` + `method`) and any `params` the API needs:

```ts
export type ColumnConfig = {
  headerName: string;
  field: string;
  renderer?: string;
  rendererParams?: Record<string, any>;
  editable?: boolean;
  onChangeApi?: {
    url: string;
    method?: "POST" | "PUT" | "PATCH";
  };
};
```

Then in your `formConfig` for Form B:

```ts
{
  id: "B",
  title: "Custom Form B",
  api: "/api/b",
  columns: [
    { headerName: "Title", field: "title" },
    {
      headerName: "Active Status",
      field: "isActive",
      renderer: "checkbox",
      editable: true,
      onChangeApi: {
        url: "/api/b/toggle-active",
        method: "POST",
      },
    },
  ],
  form: {
    type: "component" as const,
    component: "FormB",
  },
}
```

---

### 2️⃣ Update `CheckBoxRenderer` to read the API from column config

```ts
import * as React from "react";
import { ICellRendererParams } from "ag-grid-community";
import { Checkbox } from "@mui/material";

type CheckBoxRendererProps = ICellRendererParams & {
  column: {
    getColDef: () => {
      onChangeApi?: { url: string; method?: "POST" | "PUT" | "PATCH" };
    };
  };
};

export const CheckBoxRenderer: React.FC<CheckBoxRendererProps> = ({
  value,
  node,
  column,
}) => {
  const [checked, setChecked] = React.useState(!!value);

  const toggle = async () => {
    const newValue = !checked;
    setChecked(newValue);

    // Update grid
    node.setDataValue(column.getColId(), newValue);

    // Call backend if provided
    const colDef = column.getColDef();
    if (colDef.onChangeApi) {
      try {
        await fetch(colDef.onChangeApi.url, {
          method: colDef.onChangeApi.method ?? "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: node.data.id,
            [column.getColId()]: newValue,
          }),
        });
      } catch (err) {
        console.error("Failed to update checkbox", err);
        // optionally revert
        setChecked(!newValue);
        node.setDataValue(column.getColId(), !newValue);
      }
    }
  };

  return <Checkbox checked={checked} onChange={toggle} />;
};
```

---

### 3️⃣ How this works:

- LandingPage doesn’t need to handle this manually.
- `CheckBoxRenderer` automatically reads `onChangeApi` from `columnDefs`.
- You can fully control it from the backend by sending `renderer: "checkbox"` + `onChangeApi`.
- Optional: handle errors and revert the value if the API call fails.

---

✅ Advantage: Everything is **config-driven**, and you don’t need extra dialog logic in `LandingPage`.

---

If you want, I can also show a **pattern for multiple renderers**, where every renderer can optionally take `onChangeApi` or `params` from backend, so your whole grid becomes fully dynamic.

Do you want me to show that?
