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

/** Backend `Product.unit` / `ProductUnit` JSON → UI `quantityUnit` slug. */
export function mapProductUnitFromApi(unit) {
  if (unit == null || unit === "") return "kg";
  const n = String(unit).trim().toUpperCase();
  const map = {
    KG: "kg",
    CRATE: "crates",
    CRATES: "crates",
    BOX: "boxes",
    BOXES: "boxes",
    PORTION: "portions",
    PORTIONS: "portions",
    UNIT: "units",
    UNITS: "units",
  };
  if (map[n]) return map[n];
  const lower = String(unit).trim().toLowerCase();
  if (["kg", "crates", "boxes", "portions", "units"].includes(lower)) return lower;
  return "kg";
}

/** Axios / Spring body may be a raw array or `{ data: [...] }`. */
export function asApiArray(value) {
  if (Array.isArray(value)) return value;
  if (value != null && typeof value === "object" && Array.isArray(value.data)) return value.data;
  return [];
}

/** Parse id fields from API (number or numeric string). */
export function coerceId(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
