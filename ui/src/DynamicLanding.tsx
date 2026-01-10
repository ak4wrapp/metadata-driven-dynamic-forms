// ui/src/DynamicLanding.tsx
import * as React from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { DynamicForm } from "./DynamicForm";
import { CustomDialog } from "./dialogs/CustomDialog";
import { buildColumnDefs } from "./utils/buildColumnDefs";
import { useAPI } from "./hooks/useAPI";

type Entity = {
  id: string;
  title: string;
  api: string;
  columns: any[];
  fields: any[];
  actions?: any[];
  rows?: any[];
};

export function DynamicLanding() {
  console.log("Rendering DynamicLanding");

  const [activeEntity, setActiveEntity] = React.useState<Entity | null>(null);
  const [crudDialogOpen, setCrudDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"create" | "edit">(
    "create"
  );
  const [dialogData, setDialogData] = React.useState<any>(null);
  const [loadingRows, setLoadingRows] = React.useState(false);

  // Fetch all entities metadata
  // const {
  //   data: entities,
  //   loading: loadingEntities,
  //   callAPI: fetchEntities,
  // } = useAPI<Entity[]>("/admin/entities/full");

  /**
   * 1. Load all entities on mount
   * GET http://127.0.0.1:3000/api/entity/
   */
  const {
    data: entities,
    loading: loadingEntities,
    callAPI: fetchEntities,
  } = useAPI<Entity[]>("/api/entity/");

  /**
   * 2. Load full entity config when activeEntity changes
   * GET http://127.0.0.1:3000/api/entity/{id}
   */
  const { loading: loadingActiveEntity, callAPI: fetchEntityById } =
    useAPI<Entity>("", { autoFetch: false });

  React.useEffect(() => {
    fetchEntities();
  }, []);

  // Set default entity
  React.useEffect(() => {
    if (entities?.length && !activeEntity) {
      setActiveEntity(entities[0]);
    }
  }, [entities, activeEntity]);

  // Load full entity config when activeEntity.id changes
  React.useEffect(() => {
    if (!activeEntity?.id) return;

    fetchEntityById(`http://127.0.0.1:3000/api/entity/${activeEntity.id}`).then(
      (fullEntity) => {
        if (fullEntity) {
          setActiveEntity(fullEntity);
        }
      }
    );
  }, [activeEntity?.id]);

  // API caller for entity rows and CRUD
  const { callAPI: callEntityAPI } = useAPI<any[]>("", { autoFetch: false });

  // Fetch entities metadata on mount
  React.useEffect(() => {
    fetchEntities();
  }, []);

  // Set default active entity when entities load
  React.useEffect(() => {
    if (entities && entities.length > 0 && !activeEntity) {
      setActiveEntity(entities[0]);
    }
  }, [entities, activeEntity]);

  // Fetch rows whenever activeEntity changes
  React.useEffect(() => {
    if (!activeEntity) return;

    setLoadingRows(true);

    callEntityAPI(activeEntity.api)
      .then((rows) => {
        setActiveEntity((prev) => prev && { ...prev, rows: rows ?? [] });
      })
      .finally(() => setLoadingRows(false));
  }, [activeEntity?.id]);

  if (loadingEntities || !activeEntity || loadingRows)
    return <CircularProgress />;

  const columnDefs: ColDef[] = buildColumnDefs(
    activeEntity.columns,
    activeEntity.actions ?? [],
    (action, row) => console.log("Action triggered", action, row)
  );

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
    if (!activeEntity) return;

    try {
      const method = dialogMode === "create" ? "POST" : "PUT";
      const url =
        dialogMode === "edit" && data.id
          ? `${activeEntity.api}/${data.id}`
          : activeEntity.api;

      await callEntityAPI(url, { method, body: data });

      // refresh rows after submit
      const updatedRows = await callEntityAPI(activeEntity.api);
      setActiveEntity((prev) => prev && { ...prev, rows: updatedRows ?? [] });

      setCrudDialogOpen(false);
    } catch (err) {
      console.error("Failed to submit:", err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Dynamic Entities
      </Typography>

      <Box sx={{ py: 2, display: "flex", gap: 2 }}>
        {entities?.map((e) => (
          <Button
            key={e.id}
            variant={activeEntity.id === e.id ? "contained" : "outlined"}
            onClick={() => setActiveEntity(e)}
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
