import React from "react";

// Lazy load each form
export const formRegistry = {
  FormA: React.lazy(() => import("./custom-forms/FormA")),
  FormB: React.lazy(() => import("./custom-forms/FormB")),
  FormC: React.lazy(() => import("./custom-forms/FormC")),
} as const;
