// ui/src/admin/AdminEntities.tsx
import * as React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { buildColumnDefs } from "../utils/buildColumnDefs";
import { CustomDialog } from "../dialogs/CustomDialog";
import { DynamicForm } from "../DynamicForm";
import { useAPI } from "../hooks/useAPI";

type Entity = {
  id: string;
  title: string;
  api: string;
  form_type: string;
  component: string;
  columns: any[];
  fields: any[];
};

export function AdminEntities() {
  const [crudDialogOpen, setCrudDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  );
  const [dialogData, setDialogData] = React.useState<Entity | null>(null);

  // Fetch all entities using useAPI
  const {
    data: entities,
    loading,
    callAPI: fetchEntities,
  } = useAPI("/admin/entities/full", { autoFetch: true });

  const handleAddNew = () => {
    setDialogData({
      id: "",
      title: "",
      api: "",
      form_type: "schema",
      component: "",
      columns: [],
      fields: [],
    });
    setDialogMode("create");
    setCrudDialogOpen(true);
  };

  const handleEdit = (row: Entity) => {
    setDialogData(row);
    setDialogMode("edit");
    setCrudDialogOpen(true);
  };

  const handleSubmit = async (data: Entity) => {
    const method = dialogMode === "create" ? "POST" : "PUT";
    const url =
      dialogMode === "edit" ? `/admin/entities/${data.id}` : "/admin/entities";

    const { callAPI } = useAPI(url);
    await callAPI(undefined, {
      method,
      body: data,
    });

    setCrudDialogOpen(false);
    fetchEntities(); // refresh list after create/update
  };

  const columnDefs: ColDef[] = [
    { headerName: "Title", field: "title", flex: 1 },
    { headerName: "API", field: "api", flex: 1 },
    { headerName: "Form Type", field: "form_type", width: 120 },
    {
      headerName: "Actions",
      field: "__actions__",
      width: 120,
      cellRenderer: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleEdit(params.data)}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Admin: Manage Entities
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleAddNew}>
          Add Entity
        </Button>
      </Box>

      <Box sx={{ height: 500, width: "100%" }}>
        <AgGridReact rowData={entities ?? []} columnDefs={columnDefs} />
      </Box>

      <CustomDialog
        open={crudDialogOpen}
        title={dialogMode === "create" ? "Create Entity" : "Edit Entity"}
        onClose={() => setCrudDialogOpen(false)}
      >
        {dialogData ? (
          <DynamicForm
            form={{
              type: "schema",
              fields: [
                { name: "title", label: "Title", type: "text", required: true },
                { name: "api", label: "API Endpoint", type: "text" },
                { name: "form_type", label: "Form Type", type: "text" },
                { name: "component", label: "Component", type: "text" },
              ],
            }}
            initialData={dialogData}
            mode={dialogMode}
            onSubmit={handleSubmit}
          />
        ) : (
          <CircularProgress />
        )}
      </CustomDialog>
    </Box>
  );
}
