export function buildDefaultData(fields: readonly any[]) {
  return fields.reduce<Record<string, any>>((acc, field) => {
    switch (field.type) {
      case "number":
        acc[field.name] = 0;
        break;
      case "checkbox":
      case "boolean":
        acc[field.name] = false;
        break;
      default:
        acc[field.name] = "";
    }
    return acc;
  }, {});
}
