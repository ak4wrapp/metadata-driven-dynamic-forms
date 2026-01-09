// components/cell-renderers/CheckBoxRenderer.tsx
import * as React from "react";
import { ICellRendererParams, ICellEditorParams } from "ag-grid-community";
import { Checkbox } from "@mui/material";

type CheckBoxRendererProps = ICellRendererParams & ICellEditorParams;

export const CheckBoxRenderer: React.FC<CheckBoxRendererProps> = ({
  value,
  node,
  column,
  api,
}) => {
  const [checked, setChecked] = React.useState(!!value);

  const toggle = async () => {
    const newValue = !checked;
    setChecked(newValue);

    // Update row data in grid
    node.setDataValue(column.getColId(), newValue);

    alert(`Checkbox for row ID ${node.data.id} changed to ${newValue}`);

    // Optional: call backend API immediately
    // await fetch(`/api/update-status`, { method: 'POST', body: JSON.stringify({ id: node.data.id, isActive: newValue }) });
  };

  return <Checkbox checked={checked} onChange={toggle} />;
};
