import { PriceRenderer } from "./PriceRenderer";
import { ActionsCellRenderer } from "./ActionCellRenderer";
import { CheckBoxRenderer } from "./CheckBoxRenderer";

export const cellRendererRegistry: Record<string, (params?: any) => any> = {
  actions: () => ActionsCellRenderer,
  price: () => PriceRenderer,
  checkbox: () => CheckBoxRenderer,
};
