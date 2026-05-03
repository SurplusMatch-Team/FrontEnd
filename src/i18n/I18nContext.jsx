/* eslint-disable react-refresh/only-export-components -- provider + hooks share one module */
import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { en } from "./locales/en";

function get(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function interpolate(str, vars) {
  if (!vars || typeof str !== "string") return str;
  let out = str;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(String(v));
  }
  return out;
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const t = useCallback((path, vars) => {
    const raw = get(en, path);
    if (raw == null) return path;
    if (typeof raw === "string") return interpolate(raw, vars);
    return path;
  }, []);

  useEffect(() => {
    document.title = get(en, "meta.title") || "Replate";
    document.documentElement.lang = "en";
  }, []);

  const value = useMemo(() => ({ t }), [t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** English message tree for array sections (e.g. landing value cards). */
export function useLocaleMessages() {
  return en;
}
