// utils/buildColumnDefs.ts
import { ColDef } from "ag-grid-community";
import { ActionConfig } from "../form-config";
import { ActionsCellRenderer } from "../cell-renderers/ActionCellRenderer";
import { cellRendererRegistry } from "../cell-renderers/cellRendererRegistry";

export function buildColumnDefs(
  columns: any[], // backend ColumnConfig[]
  actions?: ActionConfig[],
  onAction?: (action: ActionConfig, row: any) => void
): ColDef[] {
  const baseCols: ColDef[] = columns.map((col) => {
    const rendererFactory = col.renderer
      ? cellRendererRegistry[col.renderer]
      : undefined;

    if (col.renderer && !rendererFactory) {
      console.warn(`Unknown renderer: ${col.renderer}`);
    }

    return {
      headerName: col.headerName,
      field: col.field,
      sortable: true,
      filter: true,
      flex: 1,
      hide: col.hide,
      ...(rendererFactory && {
        cellRenderer: rendererFactory(col.rendererParams),
        cellRendererParams: col.rendererParams,
      }),
    };
  });

  if (!actions || actions.length === 0) return baseCols;

  return [
    {
      headerName: "Actions",
      field: "__actions__",
      pinned: "left",
      width: 160,
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      menuTabs: [],
      cellRenderer: ActionsCellRenderer,
      cellRendererParams: {
        actions,
        onAction,
      },
    },
    ...baseCols,
  ];
}
