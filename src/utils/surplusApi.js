/**
 * `datetime-local` value (YYYY-MM-DDTHH:mm) → string Spring `LocalDateTime` deserializes (no zone suffix).
 */
export function datetimeLocalToApi(localValue) {
  if (!localValue || typeof localValue !== "string") return "";
  const trimmed = localValue.trim();
  if (trimmed.length === 16 && trimmed.includes("T")) return `${trimmed}:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

/** UI unit select → backend `ProductUnit` JSON (see backend `ProductUnit.fromJson`). */
export function mapProductUnitForApi(quantityUnit) {
  const u = String(quantityUnit || "").toLowerCase();
  const map = { kg: "KG", crates: "CRATE", boxes: "BOX", portions: "PORTION", units: "UNIT" };
  return map[u] || "UNIT";
}
