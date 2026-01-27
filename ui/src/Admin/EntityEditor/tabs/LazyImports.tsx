import React from "react";

export const LazyJsonEditor = React.lazy(
  () => import("../../../components/JsonEditor")
);
