/**
 * Best-effort message from axios error (Spring often uses `message` or `errors[]`).
 */
export function apiErrorMessage(error, fallback) {
  const d = error?.response?.data;
  if (d == null) return error?.message || fallback;
  if (typeof d === "string") return d;
  if (typeof d.message === "string") return d.message;
  if (typeof d.detail === "string") return d.detail;
  if (Array.isArray(d.errors) && d.errors.length > 0) {
    const e0 = d.errors[0];
    if (typeof e0 === "string") return e0;
    if (typeof e0?.defaultMessage === "string") return e0.defaultMessage;
  }
  return error?.message || fallback;
}
