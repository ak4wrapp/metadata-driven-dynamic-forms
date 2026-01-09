import * as React from "react";
import { ICellRendererParams } from "ag-grid-community";

type PriceRendererParams = {
  currencyField?: string;
  locale?: string;
};

export const PriceRenderer: React.FC<
  ICellRendererParams & PriceRendererParams
> = (params) => {
  const value = params.value;

  if (value == null) return null;

  const currencyField =
    params.colDef?.cellRendererParams?.currencyField ?? "currency";

  const locale = params.colDef?.cellRendererParams?.locale ?? "en-US";

  const currency = params.data?.[currencyField];

  if (!currency) {
    return value; // graceful fallback
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return value;
  }
};
