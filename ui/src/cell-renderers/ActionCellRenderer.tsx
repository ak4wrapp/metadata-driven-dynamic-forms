import * as React from "react";
import { ICellRendererParams } from "ag-grid-community";
import { ActionConfig } from "../form-config";
import { DynamicForm } from "../DynamicForm";
import { ApiActionDialog } from "../dialogs/APIActionDialog";
import { CustomDialog } from "../dialogs/CustomDialog";
import { ActionDialog } from "../dialogs/ActionDialog";
import { ActionButton } from "../components/ActionButton";
import { cellRendererRegistry } from "./cellRendererRegistry";

type Props = ICellRendererParams & {
  actions: ActionConfig[];
  afterAction?: (updatedRow?: any) => void;
};

export const ActionsCellRenderer: React.FC<Props> = ({
  actions,
  data: row,
  afterAction,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogContent, setDialogContent] =
    React.useState<React.ReactNode>(null);
  const [loading, setLoading] = React.useState(false);

  const handleActionClick = (action: ActionConfig) => {
    if (loading) return;

    if (action.type === "form") {
      setDialogTitle(action.label);
      setDialogContent(
        <DynamicForm
          form={action.form}
          mode="edit"
          initialData={row}
          onSubmit={async (data) => {
            setLoading(true);
            try {
              console.log("Form action submitted", action.id, data);
              afterAction?.(data);
            } finally {
              setLoading(false);
              setDialogOpen(false);
            }
          }}
        />
      );
      setDialogOpen(true);
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
            onClose={() => setDialogOpen(false)}
          />
        );
        setDialogOpen(true);
      } else {
        setLoading(true);
        fetch(action.api!, {
          method: action.method ?? "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        })
          .then(async (res) => {
            const data = await res.json();
            afterAction?.(data);
          })
          .finally(() => setLoading(false));
      }
    } else if (action.type === "custom") {
      setDialogTitle(action.label);
      setDialogContent(
        <ActionDialog
          action={action}
          row={row}
          onClose={() => setDialogOpen(false)}
          afterAction={afterAction}
        />
      );
      setDialogOpen(true);

      if (cellRendererRegistry[action.handler]) {
        cellRendererRegistry[action.handler](row);
      }
    }
  };

  return (
    <>
      {actions.map((action) => (
        <ActionButton
          key={action.id}
          action={action}
          row={row}
          onClick={handleActionClick}
          loading={loading}
        />
      ))}

      <CustomDialog
        open={dialogOpen}
        title={dialogTitle}
        onClose={() => setDialogOpen(false)}
      >
        {dialogContent || <div>Loading...</div>}
      </CustomDialog>
    </>
  );
};
