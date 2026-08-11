"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  LOCALE_STORAGE_KEY,
  parseLocale,
  type Locale,
} from "@/lib/i18n";

function subscribeStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function readLocale(): Locale {
  return parseLocale(localStorage.getItem(LOCALE_STORAGE_KEY));
}

export function useLocale() {
  const locale = useSyncExternalStore(
    subscribeStorage,
    readLocale,
    () => "RU" as Locale,
  );

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    window.dispatchEvent(new Event("storage"));
  }, []);

  return { locale, setLocale };
}
