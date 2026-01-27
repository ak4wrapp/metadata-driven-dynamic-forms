# UI Guide: Metadata-Driven Dynamic Forms

## How the UI Works

This UI is a dynamic, metadata-driven React app. All forms, grids, and actions are rendered based on metadata loaded from the backend. No hardcoded forms or columns—everything is driven by the entity definition.

---

## 1. Entity Loading Flow

### a. Route/Entry Point

- The app uses React Router. When you navigate to an entity (e.g. `/entity/D`), the route parameter determines which entity to load.

### b. Fetching Metadata

- The UI fetches metadata for the entity from the backend API: `/api/entity/:id`.
- This metadata includes:
  - `fields`: Array of field definitions (see FieldConfig below)
  - `columns`: Array of grid column definitions
  - `actions`: Array of available actions (form, API, custom)
  - `api`: The data endpoint for CRUD

### c. Fetching Data

- The UI uses the `api` property from the metadata to fetch the entity's data rows (for grids) or a single record (for forms).
- All data fetching is handled via React Query for caching and reactivity.

---

## 2. Rendering: Grids and Forms

### a. Grid Rendering

- The grid (AG Grid) is rendered using the `columns` metadata.
- Each column definition includes field, header, renderer, and options for custom cell rendering.
- Data is fetched from the entity's `api` endpoint.

### b. Form Rendering

- The form is rendered using the `fields` metadata.
- Each field is rendered according to its type (text, number, select, dynamic-select, etc.).
- Dynamic selects fetch their options from the `optionsAPI` endpoint defined in the field.
- Field dependencies (e.g. `dependsOn`) are handled to update options or visibility based on other field values.

### c. Custom Forms

- If the entity metadata specifies a custom form component, the UI loads and renders that React component instead of the auto-generated form.

---

## 3. FieldConfig Reference

```ts
export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "checkbox" | "date" | "dynamic-select";
  required?: boolean;
  readOnly?: boolean;
  options?: { label: string; value: string | number }[];
  optionsAPI?: string;
  optionLabel?: string;
  optionValue?: string;
  dependsOn?: string;
}
```

---

## 4. Key Files & Components

- `src/DynamicLanding.tsx`: Entry point for entity routes; loads metadata and data.
- `src/DynamicForm.tsx`: Main form renderer; chooses between auto-generated and custom forms.
- `src/SchemaForm.tsx`: Renders forms based on FieldConfig array.
- `src/Admin/EntityEditor/EntityEditor.tsx`: Admin UI for editing entity metadata.
- `src/queryClient.ts`: React Query setup for all data fetching.
- `src/hooks/useAPI.ts`, `useEntityController.ts`: Custom hooks for API and entity logic.
- `src/types.ts`: TypeScript types for all metadata.

---

## 5. Data Flow: End-to-End

1. User navigates to `/entity/:id`.
2. `DynamicLanding.tsx` fetches entity metadata from `/api/entity/:id`.
3. Metadata is passed to `DynamicForm` and grid components.
4. `DynamicForm` renders either a schema-based form (`SchemaForm`) or a custom form component. (provided in the metadata)
5. On form submit, data is posted to the entity's `api` endpoint.
6. Grids fetch and display data from the same endpoint.

---

## 6. Extending & Customizing the UI

- **Add new field types**: Update `FieldConfig` in `types.ts` and add a renderer in `schema-form/FieldRenderer.tsx`.
- **Add new entities**: Add to backend metadata and reseed; UI will auto-load.
- **Custom forms**: Register a new React component and reference it in the entity metadata.
- **Custom cell renderers**: Add to `cell-renderers/` and reference in column metadata.

---

## 7. Developer Tips

- All UI is metadata-driven—no hardcoded forms or columns.
- Use React Query for all data fetching.
- Use TypeScript for strong typing and safety.
- Use the Admin UI to edit entity metadata live (if enabled).

---

## Example: Loading and Rendering an Entity

```tsx
// In DynamicLanding.tsx
const { data: meta } = useEntityController(entityId);
const { data: rows } = useAPI(meta?.api);

return (
  <>
    <AGGrid columns={meta.columns} rows={rows} />
    <DynamicForm fields={meta.fields} ... />
  </>
);
```

---

## License

MIT
