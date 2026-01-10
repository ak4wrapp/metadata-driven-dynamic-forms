import * as React from "react";
import { Box, Tabs, Tab, Button, Divider } from "@mui/material";
import { EntityTab } from "./tabs/EntityTab";
import { ColumnsTab } from "./tabs/ColumnsTab";
import { FieldsTab } from "./tabs/FieldsTab";
import { ActionsTab } from "./tabs/ActionsTab";

import { ThemeProvider } from "@mui/material/styles";
import { entityEditorTheme } from "./entityEditorTheme";

type EntityEditorProps = {
  entity: any;
  onSave: (entity: any) => void;
};

function EntityEditorComponent({ entity, onSave }: EntityEditorProps) {
  const [tab, setTab] = React.useState(0);

  const normalizeEntity = (entity: any) => ({
    id: entity.id ?? "",
    title: entity.title ?? "",
    api: entity.api ?? "",
    form_type: entity.formType ?? "schema", // ✅ default
    component: entity.component ?? "",
    columns: Array.isArray(entity.columns) ? entity.columns : [],
    fields: Array.isArray(entity.fields) ? entity.fields : [],
    actions: Array.isArray(entity.actions) ? entity.actions : [],
  });

  const [data, setData] = React.useState<any>(() => normalizeEntity(entity));

  const updateRoot = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateArrayItem = (
    key: "columns" | "fields" | "actions",
    index: number,
    patch: any
  ) => {
    setData((prev: any) => {
      const copy = [...prev[key]];
      copy[index] = { ...copy[index], ...patch };
      return { ...prev, [key]: copy };
    });
  };

  const addArrayItem = (key: "columns" | "fields" | "actions", item: any) => {
    setData((prev: any) => ({
      ...prev,
      [key]: [...prev[key], item],
    }));
  };

  const removeArrayItem = (
    key: "columns" | "fields" | "actions",
    index: number
  ) => {
    setData((prev: any) => ({
      ...prev,
      [key]: prev[key].filter((_: any, i: number) => i !== index),
    }));
  };

  return (
    <Box sx={{ minWidth: 600 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Entity" />
        <Tab label="Columns" />
        <Tab label="Fields" />
        <Tab label="Actions" />
      </Tabs>

      <Divider sx={{ my: 2 }} />

      {tab === 0 && (
        <EntityTab data={data} updateRoot={updateRoot} isEdit={!!entity.id} />
      )}

      {tab === 1 && (
        <ColumnsTab
          columns={data.columns}
          update={(i, p) => updateArrayItem("columns", i, p)}
          add={(item) => addArrayItem("columns", item)}
          remove={(i) => removeArrayItem("columns", i)}
        />
      )}

      {tab === 2 && (
        <FieldsTab
          fields={data.fields}
          update={(i, p) => updateArrayItem("fields", i, p)}
          add={(item) => addArrayItem("fields", item)}
          remove={(i) => removeArrayItem("fields", i)}
        />
      )}

      {tab === 3 && (
        <ActionsTab
          actions={data.actions}
          update={(i, p) => updateArrayItem("actions", i, p)}
          add={(item) => addArrayItem("actions", item)}
          remove={(i) => removeArrayItem("actions", i)}
        />
      )}

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" onClick={() => onSave(data)}>
          Save Entity
        </Button>
      </Box>
    </Box>
  );
}

export function EntityEditor(props: EntityEditorProps) {
  return (
    <ThemeProvider theme={entityEditorTheme}>
      <EntityEditorComponent {...props} />
    </ThemeProvider>
  );
}
