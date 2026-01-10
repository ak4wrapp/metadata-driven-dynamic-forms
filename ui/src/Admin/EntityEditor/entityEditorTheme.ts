// entityEditorTheme.ts
import { createTheme } from "@mui/material/styles";

export const entityEditorTheme = createTheme({
  components: {
    MuiTextField: {
      defaultProps: {
        size: "small",
        margin: "dense",
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: "dense",
        size: "small",
      },
    },
    MuiButton: {
      defaultProps: {
        size: "small",
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          minHeight: 36,
          "&.Mui-expanded": {
            minHeight: 36,
          },
        },
        content: {
          margin: "4px 0",
          "&.Mui-expanded": {
            margin: "4px 0",
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          paddingTop: 4,
        },
      },
    },
  },
});
