import * as React from "react";
import Editor from "@monaco-editor/react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

type JsonEditorProps = {
  label: string;
  value: any;
  onChange: (value: any) => void;
  height?: number;
  helperText?: string;
};

export function JsonEditor({
  label,
  value,
  onChange,
  height = 140,
  helperText,
}: JsonEditorProps) {
  const [text, setText] = React.useState(JSON.stringify(value ?? {}, null, 2));

  React.useEffect(() => {
    setText(JSON.stringify(value ?? {}, null, 2));
  }, [value]);

  // Always show table for label/value pairs
  function toTableRows(val: any): { label: string; value: string }[] {
    if (Array.isArray(val)) {
      return val.map((item) =>
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "value" in item
          ? { label: String(item.label ?? ""), value: String(item.value ?? "") }
          : { label: "", value: "" }
      );
    }
    return [{ label: "", value: "" }];
  }

  const [tableRows, setTableRows] = React.useState(toTableRows(value));

  React.useEffect(() => {
    setTableRows(toTableRows(value));
  }, [value]);

  const handleTableChange = (
    idx: number,
    key: "label" | "value",
    val: string
  ) => {
    const updated = tableRows.map((row, i) =>
      i === idx ? { ...row, [key]: val } : row
    );
    setTableRows(updated);
    onChange(updated);
  };

  const handleAddRow = () => {
    const updated = [...tableRows, { label: "", value: "" }];
    setTableRows(updated);
    onChange(updated);
  };

  const handleRemoveRow = (idx: number) => {
    const updated = tableRows.filter((_, i) => i !== idx);
    setTableRows(updated);
    onChange(updated);
  };

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>

      <Box sx={{ mt: 1, mb: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Value</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableRows.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <TextField
                    value={row.label}
                    onChange={(e) =>
                      handleTableChange(idx, "label", e.target.value)
                    }
                    size="small"
                    variant="standard"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={row.value}
                    onChange={(e) =>
                      handleTableChange(idx, "value", e.target.value)
                    }
                    size="small"
                    variant="standard"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => handleRemoveRow(idx)}
                    size="small"
                    aria-label="delete"
                    disabled={tableRows.length === 1}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button onClick={handleAddRow} size="small" sx={{ mt: 1 }}>
          Add Row
        </Button>
      </Box>

      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
}

export default JsonEditor;
