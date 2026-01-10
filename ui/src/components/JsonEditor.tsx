import * as React from "react";
import Editor from "@monaco-editor/react";
import { Box, Typography } from "@mui/material";

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

  return (
    <Box>
      <Typography variant="caption" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>

      <Box
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          mt: 0.5,
        }}
      >
        <Editor
          height={height}
          defaultLanguage="json"
          value={text}
          onChange={(v) => {
            if (!v) return;
            setText(v);
            try {
              onChange(JSON.parse(v));
            } catch {
              // ignore invalid JSON (editor will show error)
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
          }}
        />
      </Box>

      {helperText && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
