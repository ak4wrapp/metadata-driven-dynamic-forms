import { AgGridReact } from "ag-grid-react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { CustomDialog } from "./dialogs/CustomDialog";
import { DynamicForm } from "./DynamicForm";
import { buildColumnDefs } from "./utils/buildColumnDefs";
import { useEntityController } from "./hooks/useEntityController";
import { useState, useMemo } from "react";

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

      <Box sx={{ py: 2, display: "flex", gap: 2 }}>
        {entities.map((e) => (
          <Button
            key={e.id}
            variant={activeEntityMeta.id === e.id ? "contained" : "outlined"}
            onClick={() => setActiveEntityMeta(e)}
          >
            {e.title}
          </Button>
        ))}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={handleAddNew}>
          Add New
        </Button>
      </Box>

      <Box sx={{ height: 500, width: "100%" }}>
        <AgGridReact
          rowData={activeEntity.rows ?? []}
          columnDefs={columnDefs}
          rowSelection="single"
          animateRows
          onRowDoubleClicked={(e) => handleRowDoubleClick(e.data)}
        />
      </Box>

      <CustomDialog
        open={crudDialogOpen}
        title={dialogMode === "create" ? "Add New" : "Edit Item"}
        onClose={() => setCrudDialogOpen(false)}
      >
        {dialogData && (
          <DynamicForm
            form={{ type: "schema", fields: activeEntity.fields }}
            initialData={dialogData}
            mode={dialogMode}
            onSubmit={handleSubmit}
          />
        )}
      </CustomDialog>
    </Box>
  );
}
