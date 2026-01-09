import * as React from "react";
import { FieldConfig, OptionsMap } from "./../types";

export function useDynamicOptions(
  fields: FieldConfig[],
  state: Record<string, any>
) {
  const [dynamicOptions, setDynamicOptions] = React.useState<OptionsMap>({});
  const prevDepsRef = React.useRef<Record<string, any>>({});

  React.useEffect(() => {
    fields.forEach((field) => {
      if (field.type !== "dynamic-select" || !field.optionsAPI) return;

      const dependsOnValue = field.dependsOn ? state[field.dependsOn] : true;

      // Dependency missing → reset
      if (field.dependsOn && !dependsOnValue) {
        setDynamicOptions((prev) => ({
          ...prev,
          [field.name]: { loading: false, options: [] },
        }));
        return;
      }

      // Prevent refetch if dependency unchanged
      if (prevDepsRef.current[field.name] === dependsOnValue) return;
      prevDepsRef.current[field.name] = dependsOnValue;

      setDynamicOptions((prev) => ({
        ...prev,
        [field.name]: { loading: true, options: [] },
      }));

      const apiUrl =
        typeof field.optionsAPI === "string"
          ? resolveAPI(field.optionsAPI, state)
          : field.optionsAPI;

      fetch(apiUrl)
        .then((res) => res.json())
        .then((data) => {
          setDynamicOptions((prev) => ({
            ...prev,
            [field.name]: { loading: false, options: data },
          }));
        })
        .catch(() => {
          setDynamicOptions((prev) => ({
            ...prev,
            [field.name]: { loading: false, options: [] },
          }));
        });
    });
  }, [fields, state]);

  const resetOptionsForField = (fieldName: string) => {
    setDynamicOptions((prev) => ({
      ...prev,
      [fieldName]: { loading: false, options: [] },
    }));
  };

  return { dynamicOptions, resetOptionsForField };
}

// Utility
function resolveAPI(template: string, state: Record<string, any>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => state[key] ?? "");
}
