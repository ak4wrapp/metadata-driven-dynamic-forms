import * as React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { themeAlpine } from "ag-grid-community";

import { ActionConfig, formConfig } from "./form-config";
import { DynamicForm } from "./DynamicForm";
import { buildDefaultData } from "./utils/fieldDataBuilder";
import { rowData } from "./row-data";
import { ApiActionDialog } from "./dialogs/APIActionDialog";
import { CustomDialog } from "./dialogs/CustomDialog";
import { ActionDialog } from "./dialogs/ActionDialog";
import { ActionsCellRenderer } from "./cell-renderers/ActionCellRenderer";
import { cellRendererRegistry } from "./cell-renderers/cellRendererRegistry";
import { buildColumnDefs } from "./utils/buildColumnDefs";

type EntityKey = (typeof formConfig)[number]["id"];

export default function LandingPage() {
  const formConfigMap = React.useMemo(
    () => Object.fromEntries(formConfig.map((cfg) => [cfg.id, cfg])),
    []
  );
  const rowDataMap = React.useMemo(
    () => Object.fromEntries(rowData.map((d) => [d.id, d.rows])),
    []
  );
  const entityKeys = React.useMemo(() => formConfig.map((cfg) => cfg.id), []);
  const [activeEntity, setActiveEntity] = React.useState<EntityKey>(
    entityKeys[0]
  );

  // Dialog states
  const [crudDialogOpen, setCrudDialogOpen] = React.useState(false);
  const [actionDialogOpen, setActionDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  );
  const [dialogData, setDialogData] = React.useState<any>(null);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] =
    React.useState<React.ReactNode>(null);

  const config = formConfigMap[activeEntity];
  const rows = rowDataMap[activeEntity] ?? [];

  const handleAction = (action: ActionConfig, row: any) => {
    if (action.type === "form") {
      setDialogTitle(action.label);
      setDialogContent(
        <DynamicForm
          form={action.form}
          mode="edit"
          initialData={row}
          onSubmit={async (d) => console.log("Action form submit", d)}
        />
      );
      setActionDialogOpen(true);
    } else if (action.type === "api") {
      const dialogOpts = action.dialogOptions;
      if (dialogOpts) {
        setDialogTitle(dialogOpts.title);
        setDialogContent(
          <ApiActionDialog
            action={action}
            actionApi={action.api!}
            method={action.method}
            row={row}
            dialogContent={dialogOpts.content}
            onClose={() => setActionDialogOpen(false)}
          />
        );
        setActionDialogOpen(true);
      } else {
        // immediate API call
        fetch(action.api!, {
          method: action.method ?? "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
      }
    } else if (action.type === "custom") {
      // customActionRegistry[action.handler]?.(row);
      setDialogTitle(action.label);
      setDialogContent(
        <ActionDialog
          action={action}
          row={row}
          onClose={() => setActionDialogOpen(false)}
        />
      );
      setActionDialogOpen(true);
    }
  };

  const buildActionColumn = (actions: ActionConfig[]): ColDef => ({
    headerName: "Actions",
    field: "__actions__",
    pinned: "left",
    width: 160,
    sortable: false,
    filter: false,
    suppressHeaderMenuButton: true,
    menuTabs: [],
    cellRenderer: ActionsCellRenderer,
    cellRendererParams: { actions },
  });

  const columnDefs = React.useMemo(
    () => buildColumnDefs(config.columns, config.actions, handleAction),
    [config, handleAction]
  );

  const handleAddNew = () => {
    const cfg = formConfigMap[activeEntity];
    setDialogData(
      cfg.form.type === "schema" ? buildDefaultData(cfg.form.fields) : {}
    );
    setDialogMode("create");
    setCrudDialogOpen(true);
  };

  const handleRowDoubleClick = (row: any) => {
    setDialogData(row);
    setDialogMode("edit");
    setCrudDialogOpen(true);
  };

  const handleSubmit = async (data: any) => {
    const cfg = formConfigMap[activeEntity];
    await fetch(cfg.api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setCrudDialogOpen(false);
  };

  return (
    <Box sx={{ p: 4, m: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dynamic Entity Table + Forms
      </Typography>

      {/* Entity Buttons */}
      <Box sx={{ py: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        {entityKeys.map((key) => (
          <Button
            key={key}
            variant={key === activeEntity ? "contained" : "outlined"}
            onClick={() => setActiveEntity(key)}
          >
            {formConfigMap[key].title}
          </Button>
        ))}
      </Box>

      {/* Add New */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={handleAddNew}>
          Add New Item
        </Button>
      </Box>

      <Box sx={{ height: 500, width: "100%" }}>
        {/* <AgGridReact
          theme={themeAlpine}
          rowData={rows}
          columnDefs={columnDefs}
          rowSelection="single"
          animateRows
          onRowDoubleClicked={(event) => handleRowDoubleClick(event.data)}
          defaultColDef={{
            resizable: true,
          }}
        /> */}
        <AgGridReact
          rowData={rows}
          columnDefs={columnDefs}
          rowSelection="single"
          animateRows
          onRowDoubleClicked={(event) => handleRowDoubleClick(event.data)}
          defaultColDef={{ resizable: true }}
        />
      </Box>

      {/* CRUD Dialog */}
      <CustomDialog
        open={crudDialogOpen}
        title={dialogMode === "create" ? "Add New Item" : "Edit Item"}
        onClose={() => setCrudDialogOpen(false)}
      >
        {dialogData ? (
          <DynamicForm
            form={config.form}
            mode={dialogMode}
            initialData={dialogData}
            onSubmit={handleSubmit}
          />
        ) : (
          <CircularProgress />
        )}
      </CustomDialog>

      {/* Action Dialog */}
      <CustomDialog
        open={actionDialogOpen}
        title={dialogTitle}
        onClose={() => setActionDialogOpen(false)}
      >
        {dialogContent}
      </CustomDialog>
    </Box>
  );
}
