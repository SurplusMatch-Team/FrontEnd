/* eslint-disable react-refresh/only-export-components -- provider + hooks share one module */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { en } from "./locales/en";
import { tr } from "./locales/tr";

const LOCALE_STORAGE_KEY = "replate-locale";

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

function readStoredLocale() {
  try {
    const s = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (s === "tr" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return "en";
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readStoredLocale);

  const messages = locale === "tr" ? tr : en;

  const setLocale = useCallback((next) => {
    const v = next === "tr" ? "tr" : "en";
    setLocaleState(v);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (path, vars) => {
      let raw = get(messages, path);
      if (raw == null && locale === "tr") {
        raw = get(en, path);
      }
      if (raw == null) return path;
      if (typeof raw === "string") return interpolate(raw, vars);
      return path;
    },
    [locale, messages],
  );

  useEffect(() => {
    document.documentElement.lang = locale === "tr" ? "tr" : "en";
    const title = get(messages, "meta.title") ?? get(en, "meta.title");
    if (title) document.title = title;
  }, [locale, messages]);

  const value = useMemo(() => ({ t, locale, setLocale }), [t, locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/** Full message tree for the active locale (e.g. landing value cards). */
export function useLocaleMessages() {
  const ctx = useContext(I18nContext);
  if (!ctx) return en;
  return ctx.locale === "tr" ? tr : en;
}
