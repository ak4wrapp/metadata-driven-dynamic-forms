/**
 * Builds an object containing default values for a given array of field definitions.
 *
 * Each field's default value is determined by its `type` property:
 * - `"number"` fields default to `0`
 * - `"checkbox"` and `"boolean"` fields default to `false`
 * - All other field types default to an empty string `""`
 *
 * @param fields - A readonly array of field definition objects. Each object should have at least a `type` and `name` property.
 * @returns An object mapping each field's `name` to its corresponding default value.
 *
 * @remarks
 * The `readonly` modifier in the parameter type (`readonly any[]`) indicates that the input array cannot be mutated within the function.
 */
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
