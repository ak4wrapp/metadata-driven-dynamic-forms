import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { AgGridReact } from "ag-grid-react";
import { EntityEditor } from "./EntityEditor";
import { useAPI } from "../hooks/useAPI";

export function AdminEntities() {
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"create" | "edit">("create");
  const [entity, setEntity] = React.useState<any>(null);

  const { data, loading, callAPI } = useAPI("/api/admin/entities", {
    autoFetch: true,
  });

  const saveEntity = async (payload: any) => {
    await callAPI(
      mode === "create"
        ? "/api/admin/entities"
        : `/api/admin/entities/${payload.id}`,
      {
        method: mode === "create" ? "POST" : "PUT",
        body: payload,
      }
    );
    setOpen(false);
    setEntity(null);
    callAPI(); // reload list
  };

  const columnDefs = [
    { field: "title", flex: 1 },
    { field: "api", flex: 1 },
    { field: "formType", width: 120 },
    {
      headerName: "Actions",
      width: 120,
      cellRenderer: (p: any) => (
        <Button
          size="small"
          onClick={() => {
            setEntity(p.data);
            setMode("edit");
            setOpen(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  if (loading) return <CircularProgress />;

  return (
    <Box p={4}>
      <Typography variant="h5">Admin: Entities</Typography>

      <Button
        sx={{ my: 2 }}
        variant="contained"
        onClick={() => {
          setEntity({
            id: "",
            title: "",
            api: "",
            form_type: "schema",
            component: null,
            columns: [],
            fields: [],
            actions: [],
          });
          setMode("create");
          setOpen(true);
        }}
      >
        Add Entity
      </Button>

      <Box height={500}>
        <AgGridReact rowData={data ?? []} columnDefs={columnDefs} />
      </Box>

      {/* ---------- MUI Dialog ---------- */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="lg"
        scroll="paper"
      >
        <DialogTitle>
          {mode === "create" ? "Create Entity" : "Edit Entity"}
        </DialogTitle>

        <DialogContent dividers>
          {entity && <EntityEditor entity={entity} onSave={saveEntity} />}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
