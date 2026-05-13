import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let leafletIconsFixed = false;

function fixLeafletDefaultIcons() {
  if (leafletIconsFixed) return;
  leafletIconsFixed = true;
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
  });
}

/**
 * Small OSM map (Leaflet). Parent must give fixed height container via className.
 */
export function MiniLeafletMap({ latitude, longitude, popupLabel = "", className = "" }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!el || !Number.isFinite(lat) || !Number.isFinite(lng)) return;

    fixLeafletDefaultIcons();

    const map = L.map(el, { scrollWheelZoom: false }).setView([lat, lng], 14);
    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const m = L.marker([lat, lng]).addTo(map);
    if (popupLabel) m.bindPopup(String(popupLabel));

    const t = window.setTimeout(() => {
      map.invalidateSize();
    }, 50);

    return () => {
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, popupLabel]);

  return <div ref={containerRef} className={`min-h-[180px] w-full ${className}`} />;
}
