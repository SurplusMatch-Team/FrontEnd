/**
 * Build an OpenStreetMap URL for a marker or search (no API key).
 */
export function buildOpenStreetMapHref({ latitude, longitude, query } = {}) {
  const la = Number(latitude);
  const lo = Number(longitude);
  if (Number.isFinite(la) && Number.isFinite(lo)) {
    return `https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=15/${la}/${lo}`;
  }
  const q = query != null ? String(query).trim() : "";
  if (q) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
  }
  return null;
}
