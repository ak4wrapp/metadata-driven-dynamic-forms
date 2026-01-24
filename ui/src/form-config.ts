// ui/src/form-config.ts

import { FieldConfig } from "./types";

type ActionFormConfig =
  | {
      type: "schema";
      fields: FieldConfig[];
    }
  | {
      type: "component";
      component: string;
    };

type ColorOption =
  | "inherit"
  | "primary"
  | "secondary"
  | "error"
  | "info"
  | "success"
  | "warning";

type DialogOptions = {
  title: string;
  content: React.ReactNode;
};

export type ActionConfig =
  | {
      id: string;
      label: string;
      type: "form";
      icon?: string;
      iconColor?: ColorOption;
      tooltip?: string;
      form: ActionFormConfig;
    }
  | {
      id: string;
      label: string;
      type: "api";
      idField?: "id";
      dialogOptions?: DialogOptions;
      icon?: string;
      iconColor?: ColorOption;
      api: string;
      method?: "POST" | "PUT" | "DELETE";
      confirm?: boolean;
      tooltip?: string;
    }
  | {
      id: string;
      label: string;
      icon?: string;
      iconColor?: ColorOption;
      type: "custom";
      handler: string;
      tooltip?: string;
    };

export type SchemaFormDefinition = {
  formType: "schema";
  fields: FieldConfig[];
};

export type ComponentFormDefinition = {
  formType: "component";
  component: string;
};

export type FormDefinition = SchemaFormDefinition | ComponentFormDefinition;

export type ColumnConfig = {
  headerName: string;
  field: string;
  renderer?: string;
  rendererParams?: Record<string, any>;
  hide?: boolean;
};

export type EntityConfig = {
  id: string;
  title: string;
  api: string;
  columns: ColumnConfig[];
  form: FormDefinition;
  actions?: ActionConfig[];
};

// // Columns can be used in tables if needed
// export const formConfig: EntityConfig[] = [
//   {
//     id: "A",
//     title: "Schema Form A",
//     api: "/api/a",
//     columns: [
//       { headerName: "Name", field: "name" },
//       { headerName: "Age", field: "age" },
//       { headerName: "Country", field: "country" },
//       { headerName: "State", field: "state" },
//       { headerName: "BirthDate", field: "birthDate" },
//       {
//         headerName: "Salary",
//         field: "salary",
//         renderer: "price",
//         rendererParams: {
//           currencyField: "currency",
//         },
//       },
//       { headerName: "Currency", field: "currency", hide: true },
//     ],
//     form: {
//       type: "schema" as const,
//       fields: [
//         { name: "name", label: "Name", type: "text", required: true },
//         { name: "age", label: "Age", type: "number" },
//         {
//           name: "country",
//           label: "Country",
//           type: "dynamic-select",
//           optionsAPI: "/api/countries",
//           optionLabel: "name",
//           optionValue: "code",
//         },
//         {
//           name: "state",
//           label: "State",
//           type: "dynamic-select",
//           dependsOn: "country",
//           optionsAPI: "/api/states?country={country}",
//           optionLabel: "name",
//           optionValue: "code",
//         },
//         { name: "birthDate", label: "Birth Date", type: "date" },
//         { name: "salary", label: "Salary", type: "number" },
//         {
//           name: "currency",
//           label: "Currency",
//           type: "select",
//           options: [
//             { label: "USD", value: "USD" },
//             { label: "EUR", value: "EUR" },
//             { label: "GBP", value: "GBP" },
//             { label: "INR", value: "INR" },
//           ],
//           optionLabel: "label",
//           optionValue: "value",
//         },
//       ] as FieldConfig[],
//     },
//     actions: [
//       {
//         id: "viewDetails",
//         label: "View Details",
//         tooltip: "View detailed information",
//         type: "form",
//         icon: "info",
//         iconColor: "primary",
//         form: {
//           type: "schema",
//           fields: [
//             { name: "name", label: "Name", type: "text", readOnly: true },
//             { name: "age", label: "Age", type: "number", readOnly: true },
//           ],
//         },
//       },
//       {
//         id: "deactivate",
//         label: "Deactivate",
//         tooltip: "Deactivate this record",
//         icon: "block",
//         iconColor: "error",
//         type: "api",
//         api: "/api/a/deactivate",
//         dialogOptions: {
//           title: "Deactivate Item",
//           content: "Are you sure you want to deactivate this item?",
//         },
//         method: "POST",
//         confirm: true,
//       },
//       {
//         id: "export",
//         label: "Export",
//         tooltip: "Export this record's data",
//         icon: "download",
//         iconColor: "primary",
//         type: "custom",
//         handler: "exportRow",
//       },
//       {
//         id: "auditLog",
//         label: "Audit Log",
//         tooltip: "View the audit log for this record",
//         type: "custom",
//         icon: "article",
//         iconColor: "secondary",
//         handler: "openAuditLog",
//       },
//     ],
//   },
//   {
//     id: "schemaForm2",
//     title: "Schema Form 2",
//     api: "/api/schemaForm2",
//     columns: [
//       { headerName: "Title", field: "title" },
//       { headerName: "Type", field: "type" },
//       { headerName: "Active Status", field: "isActive", renderer: "checkbox" },
//     ],
//     form: {
//       type: "schema" as const,
//       fields: [
//         { name: "title", label: "Title", type: "text", required: true },
//         {
//           name: "type",
//           label: "Type",
//           type: "select",
//           options: [
//             { label: "Type A", value: "A" },
//             { label: "Type B", value: "B" },
//           ],
//         },
//         { name: "isActive", label: "Active Status", type: "checkbox" },
//       ] as FieldConfig[],
//     },
//   },

//   {
//     id: "B",
//     title: "Custom Form B",
//     api: "/api/b",
//     columns: [
//       { headerName: "Title", field: "title" },
//       { headerName: "Active Status", field: "isActive" },
//     ],
//     form: {
//       type: "component" as const,
//       component: "FormB",
//     },
//   },

//   {
//     id: "C",
//     title: "Custom Form C",
//     api: "/api/c",
//     columns: [
//       { headerName: "Description", field: "description" },
//       { headerName: "Quantity", field: "quantity" },
//     ],
//     form: {
//       type: "component" as const,
//       component: "FormC",
//     },
//   },
//   {
//     id: "D",
//     title: "Schema Form D with Dynamic Select",
//     api: "/api/d",
//     columns: [
//       { headerName: "Item Name", field: "itemName" },
//       { headerName: "Category", field: "category" },
//     ],
//     form: {
//       type: "schema" as const,
//       fields: [
//         { name: "itemName", label: "Item Name", type: "text", required: true },
//         {
//           name: "category",
//           label: "Category",
//           type: "dynamic-select",
//           optionsAPI: "/api/categories",
//         },
//       ] as FieldConfig[],
//     },
//   },
//   {
//     id: "E",
//     title: "Schema Form E with Dependent Fields",
//     api: "/api/e",
//     columns: [
//       { headerName: "Country", field: "country" },
//       { headerName: "State", field: "state" },
//     ],
//     form: {
//       type: "schema" as const,
//       fields: [
//         {
//           name: "country",
//           label: "Country",
//           type: "dynamic-select",
//           optionsAPI: "/api/countries",
//           optionLabel: "name",
//           optionValue: "code",
//         },
//         {
//           name: "state",
//           label: "State",
//           type: "dynamic-select",
//           dependsOn: "country",
//           optionsAPI: "/api/states?country={country}",
//           optionLabel: "name",
//           optionValue: "code",
//         },
//       ] as FieldConfig[],
//     },
//   },
// ];
