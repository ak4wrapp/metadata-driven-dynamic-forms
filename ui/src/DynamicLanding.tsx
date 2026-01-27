import { Box, Button, CircularProgress, Typography } from "@mui/material";
// import { CustomDialog } from "./dialogs/CustomDialog";
// import { DynamicForm } from "./DynamicForm";
import { buildColumnDefs } from "./utils/buildColumnDefs";
import { useEntityController } from "./hooks/useEntityController";
import { useState, useMemo } from "react";
import { ComponentFormDefinition, SchemaFormDefinition } from "./form-config";
import React from "react";

const LazyAgGridReact = React.lazy(() =>
  import("ag-grid-react").then((module) => ({
    default: module.AgGridReact,
  }))
);
const LazyCustomDialog = React.lazy(() =>
  import("./dialogs/CustomDialog").then((module) => ({
    default: module.CustomDialog,
  }))
);
const LazyDynamicForm = React.lazy(() =>
  import("./DynamicForm").then((module) => ({
    default: module.DynamicForm,
  }))
);
export function DynamicLanding() {
  const {
    entities,
    activeEntityMeta,
    setActiveEntityMeta,
    activeEntity,
    columnsReady,
    loading,
    submitEntityData,
  } = useEntityController();

  const [crudDialogOpen, setCrudDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogData, setDialogData] = useState<any>(null);

  const columnDefs = useMemo(() => {
    if (!columnsReady || !activeEntity) return [];
    return buildColumnDefs(
      activeEntity.columns,
      activeEntity.actions ?? [],
      (action, row) => console.log("Action triggered", action, row)
    );
  }, [columnsReady, activeEntity]);

  if (
    !activeEntityMeta ||
    !activeEntity ||
    !columnsReady ||
    loading.entities ||
    loading.entity ||
    loading.rows
  ) {
    return <CircularProgress />;
  }

  const handleAddNew = () => {
    setDialogData(
      activeEntity.fields.reduce((acc, f) => {
        acc[f.name] = "";
        return acc;
      }, {} as any)
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
    await submitEntityData(data, dialogMode);
    setCrudDialogOpen(false);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dynamic Entities
      </Typography>

      <Box>
        <Typography variant="subtitle1">Entity types:</Typography>
        <Typography variant="body2">
          • <strong>Custom Forms</strong> — use a predefined React form
          component.
          <br />• <strong>Schema Forms</strong> — are automatically generated
          from field definitions.
        </Typography>
      </Box>

      <Box sx={{ py: 2, display: "flex", gap: 2 }}>
        {entities.map((e) => {
          const isActive = activeEntityMeta.id === e.id;
          const color = e.formType === "schema" ? "primary" : "secondary";

          return (
            <Button
              key={e.id}
              variant={isActive ? "contained" : "outlined"}
              color={color}
              onClick={() => setActiveEntityMeta(e)}
              startIcon={
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor:
                      e.formType === "schema"
                        ? "primary.main"
                        : "secondary.main",
                  }}
                ></Box>
              }
            >
              {e.title}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={handleAddNew}>
          Add New
        </Button>
      </Box>

      <Box sx={{ height: 500, width: "100%" }}>
        <LazyAgGridReact
          rowData={activeEntity.rows ?? []}
          columnDefs={columnDefs}
          rowSelection="single"
          animateRows
          onRowDoubleClicked={(e) => handleRowDoubleClick(e.data)}
        />
      </Box>

      <LazyCustomDialog
        open={crudDialogOpen}
        title={dialogMode === "create" ? "Add New" : "Edit Item"}
        onClose={() => setCrudDialogOpen(false)}
      >
        {dialogData && (
          <LazyDynamicForm
            form={
              activeEntity.formType === "component"
                ? (activeEntity as ComponentFormDefinition)
                : (activeEntity as SchemaFormDefinition)
            }
            initialData={dialogData}
            mode={dialogMode}
            onSubmit={handleSubmit}
          />
        )}
      </LazyCustomDialog>
    </Box>
  );
}
